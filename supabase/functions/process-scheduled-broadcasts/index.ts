import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PROCESS-SCHEDULED] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all pending broadcasts that are due
    const { data: dueBroadcasts, error: fetchError } = await supabaseClient
      .from("scheduled_broadcasts")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", new Date().toISOString());

    if (fetchError) {
      throw new Error(`Error fetching broadcasts: ${fetchError.message}`);
    }

    logStep("Found due broadcasts", { count: dueBroadcasts?.length || 0 });

    if (!dueBroadcasts || dueBroadcasts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processedCount = 0;

    for (const broadcast of dueBroadcasts) {
      logStep("Processing broadcast", { id: broadcast.id, title: broadcast.title });

      try {
        // Get preference column based on type
        const preferenceColumn = getPreferenceColumn(broadcast.type);

        // Get all user profiles
        const { data: allProfiles, error: profilesError } = await supabaseClient
          .from("profiles")
          .select("user_id");

        if (profilesError) {
          logStep("Error fetching profiles", profilesError);
          continue;
        }

        // Get users who have opted out
        const { data: optedOutUsers } = await supabaseClient
          .from("notification_preferences")
          .select("user_id")
          .eq(preferenceColumn, false);

        const optedOutIds = new Set((optedOutUsers || []).map((u) => u.user_id));

        // Filter to users who haven't opted out (exclude the creator)
        const targetUsers = (allProfiles || []).filter(
          (p) => !optedOutIds.has(p.user_id) && p.user_id !== broadcast.created_by
        );

        logStep("Target users", { count: targetUsers.length });

        if (targetUsers.length === 0) {
          // Mark as sent with 0 notified
          await supabaseClient
            .from("scheduled_broadcasts")
            .update({ 
              status: "sent", 
              sent_at: new Date().toISOString(),
              notified_count: 0 
            })
            .eq("id", broadcast.id);
          
          processedCount++;
          continue;
        }

        // Create notifications
        const notifications = targetUsers.map((user) => ({
          user_id: user.user_id,
          title: broadcast.title,
          message: broadcast.message,
          type: broadcast.type,
          actor_id: broadcast.created_by,
          is_read: false,
        }));

        // Insert in batches
        const batchSize = 100;
        let insertedCount = 0;

        for (let i = 0; i < notifications.length; i += batchSize) {
          const batch = notifications.slice(i, i + batchSize);
          const { data: insertedBatch, error: insertError } = await supabaseClient
            .from("notifications")
            .insert(batch)
            .select("id, user_id");

          if (insertError) {
            logStep("Error inserting batch", insertError);
          } else if (insertedBatch) {
            insertedCount += insertedBatch.length;

            // Track analytics
            const analyticsEvents = insertedBatch.map((notification: any) => ({
              notification_id: notification.id,
              user_id: notification.user_id,
              event_type: "delivered",
              metadata: { type: broadcast.type, scheduled: true, broadcast_id: broadcast.id }
            }));

            await supabaseClient
              .from("notification_analytics")
              .insert(analyticsEvents);
          }
        }

        // Update broadcast status
        await supabaseClient
          .from("scheduled_broadcasts")
          .update({ 
            status: "sent", 
            sent_at: new Date().toISOString(),
            notified_count: insertedCount 
          })
          .eq("id", broadcast.id);

        logStep("Broadcast sent", { id: broadcast.id, notified: insertedCount });
        processedCount++;

      } catch (broadcastError) {
        logStep("Error processing broadcast", { id: broadcast.id, error: broadcastError });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: processedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function getPreferenceColumn(type: string): string {
  switch (type) {
    case "course_update":
      return "course_updates";
    case "coach_message":
      return "coach_messages";
    default:
      return "course_updates";
  }
}
