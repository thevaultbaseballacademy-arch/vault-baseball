import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimData, error: claimErr } = await userClient.auth.getClaims(token);
    if (claimErr || !claimData?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimData.claims.sub as string;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const { orderId, action, notes } = body as { orderId?: string; action?: "paid" | "canceled"; notes?: string };
    if (!orderId || !action || !["paid", "canceled"].includes(action)) {
      return json({ error: "Invalid request" }, 400);
    }

    const newStatus = action === "paid" ? "paid" : "canceled";

    const { data: order, error: orderErr } = await admin
      .from("payment_orders")
      .update({
        status: newStatus,
        confirmed_by: userId,
        confirmed_at: new Date().toISOString(),
        notes: notes ?? null,
      })
      .eq("id", orderId)
      .select("id, product_type, product_id")
      .single();

    if (orderErr || !order) return json({ error: orderErr?.message ?? "Order not found" }, 404);

    // Sync linked product status
    if (order.product_type === "summer_camp" && order.product_id) {
      await admin
        .from("summer_camp_registrations")
        .update({
          status: newStatus === "paid" ? "confirmed" : "canceled",
          paid_at: newStatus === "paid" ? new Date().toISOString() : null,
        })
        .eq("id", order.product_id);

      // Fire confirmation + staff notifications on paid
      if (newStatus === "paid") {
        const { data: reg } = await admin
          .from("summer_camp_registrations")
          .select("*")
          .eq("id", order.product_id)
          .maybeSingle();

        if (reg) {
          const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
          const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
          const amountPaid = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
            .format(((reg as any).amount_paid_cents ?? 0) / 100);
          const confirmationNumber = `CAMP-${String(order.product_id).slice(0, 8).toUpperCase()}`;

          const send = (payload: Record<string, unknown>) =>
            fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json", apikey: anonKey, Authorization: `Bearer ${anonKey}` },
              body: JSON.stringify(payload),
            }).catch(() => {});

          await Promise.allSettled([
            send({
              templateName: "camp-confirmation",
              recipientEmail: (reg as any).parent_email,
              idempotencyKey: `camp-confirm-bank-${order.product_id}`,
              templateData: {
                playerName: (reg as any).player_first_name,
                parentName: (reg as any).parent_name,
                campName: (reg as any).camp_location ?? "Summer Development Camp",
                registrationType: (reg as any).registration_type,
                amountPaid,
                confirmationNumber,
              },
            }),
            ...["staff@methods22.com", "Eddie@methods22.com"].map((to) =>
              send({
                templateName: "camp-staff-notification",
                recipientEmail: to,
                idempotencyKey: `camp-staff-bank-${order.product_id}-${to}`,
                templateData: {
                  playerName: `${(reg as any).player_first_name} ${(reg as any).player_last_name}`,
                  campName: (reg as any).camp_location,
                  registrationType: (reg as any).registration_type,
                  amountPaid,
                  parentName: (reg as any).parent_name,
                  parentEmail: (reg as any).parent_email,
                  confirmationNumber,
                },
              }),
            ),
          ]);
        }
      }
    }

    return json({ success: true, status: newStatus });
  } catch (err) {
    console.error("admin-confirm-bank-transfer error", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
