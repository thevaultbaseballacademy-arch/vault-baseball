import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token || typeof token !== "string" || token.length < 10 || token.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing share token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate token format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch report by share_token AND is_published
    const { data: report, error } = await supabaseAdmin
      .from("athlete_progress_reports")
      .select("*")
      .eq("share_token", token)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !report) {
      return new Response(
        JSON.stringify({ error: "Report not found or not yet published" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get athlete profile (public info only)
    const { data: profiles } = await supabaseAdmin.rpc("get_public_profiles_by_ids", {
      user_ids: [report.athlete_user_id],
    });

    const athleteProfile = profiles && profiles.length > 0 ? profiles[0] : null;

    // Optionally mark view if authenticated
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const userToken = authHeader.replace("Bearer ", "");
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: `Bearer ${userToken}` } } }
      );
      const { data: claimsData } = await userClient.auth.getClaims(userToken);
      if (claimsData?.claims?.sub) {
        const userId = claimsData.claims.sub;
        if (userId === report.athlete_user_id) {
          await supabaseAdmin
            .from("athlete_progress_reports")
            .update({ athlete_viewed_at: new Date().toISOString() })
            .eq("id", report.id);
        } else {
          await supabaseAdmin
            .from("athlete_progress_reports")
            .update({ parent_viewed_at: new Date().toISOString() })
            .eq("id", report.id);
        }
      }
    }

    return new Response(
      JSON.stringify({ report, athleteProfile }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
