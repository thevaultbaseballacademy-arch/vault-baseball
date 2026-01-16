import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationPayload {
  type: "course_update" | "community_mention" | "community_like" | "community_comment" | "coach_message";
  title: string;
  body: string;
  data?: Record<string, string>;
  targetUserIds?: string[];
  // For broadcast to all users with specific preferences
  broadcast?: boolean;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-PUSH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Authentication: Require valid user JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logStep("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      logStep("Invalid JWT", { error: claimsError?.message });
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authenticatedUserId = claimsData.claims.sub;
    logStep("Authenticated user", { userId: authenticatedUserId });

    // Use service role for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const payload: PushNotificationPayload = await req.json();
    logStep("Received payload", payload);

    // For broadcast notifications, check if user is admin
    if (payload.broadcast) {
      const { data: roleData } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", authenticatedUserId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        logStep("Broadcast attempted by non-admin", { userId: authenticatedUserId });
        return new Response(
          JSON.stringify({ error: "Only admins can send broadcast notifications" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get target user IDs based on notification type and preferences
    let userIds: string[] = payload.targetUserIds || [];

    if (payload.broadcast) {
      // Get all users who have enabled this notification type
      const preferenceColumn = getPreferenceColumn(payload.type);
      
      const { data: preferences, error: prefError } = await supabaseClient
        .from("notification_preferences")
        .select("user_id")
        .eq(preferenceColumn, true);

      if (prefError) {
        logStep("Error fetching preferences", prefError);
      } else if (preferences) {
        userIds = preferences.map((p: any) => p.user_id);
      }
    } else if (userIds.length > 0) {
      // Filter by user preferences for targeted notifications
      const preferenceColumn = getPreferenceColumn(payload.type);
      
      const { data: preferences } = await supabaseClient
        .from("notification_preferences")
        .select("user_id")
        .in("user_id", userIds)
        .eq(preferenceColumn, true);

      if (preferences) {
        userIds = preferences.map((p: any) => p.user_id);
      }
    }

    logStep("Target users", { count: userIds.length });

    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No users to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get push tokens for these users
    const { data: tokens, error: tokenError } = await supabaseClient
      .from("push_tokens")
      .select("token, platform, user_id")
      .in("user_id", userIds);

    if (tokenError) {
      throw new Error(`Error fetching tokens: ${tokenError.message}`);
    }

    logStep("Found tokens", { count: tokens?.length || 0 });

    // In a production app, you would send these to APNs (iOS) and FCM (Android)
    // For now, we'll store the notification in the database for in-app display
    const notificationsToInsert = userIds.map((userId) => ({
      user_id: userId,
      title: payload.title,
      message: payload.body,
      type: payload.type,
      actor_id: payload.data?.actorId || authenticatedUserId, // Use authenticated user as actor
      post_id: payload.data?.postId || null,
      is_read: false,
    }));

    // Insert notifications (ignore duplicates)
    const { data: insertedNotifications, error: insertError } = await supabaseClient
      .from("notifications")
      .insert(notificationsToInsert)
      .select("id, user_id");

    if (insertError) {
      logStep("Error inserting notifications", insertError);
    }

    // Track delivered analytics events
    if (insertedNotifications && insertedNotifications.length > 0) {
      const analyticsEvents = insertedNotifications.map((notification: any) => ({
        notification_id: notification.id,
        user_id: notification.user_id,
        event_type: "delivered",
        metadata: { type: payload.type }
      }));

      const { error: analyticsError } = await supabaseClient
        .from("notification_analytics")
        .insert(analyticsEvents);

      if (analyticsError) {
        logStep("Error tracking analytics", analyticsError);
      } else {
        logStep("Tracked delivery events", { count: analyticsEvents.length });
      }
    }

    // Return success with token info for native push sending
    return new Response(
      JSON.stringify({
        success: true,
        tokensToNotify: tokens || [],
        notification: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
        },
      }),
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
    case "community_mention":
      return "community_mentions";
    case "community_like":
      return "community_likes";
    case "community_comment":
      return "community_comments";
    case "coach_message":
      return "coach_messages";
    default:
      return "course_updates";
  }
}
