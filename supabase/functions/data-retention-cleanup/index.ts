import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting data retention cleanup...");

    // Purge old user sessions (default: 90 days)
    const { data: sessionsDeleted, error: sessionsError } = await supabase.rpc(
      "purge_old_user_sessions",
      { retention_days: 90 }
    );

    if (sessionsError) {
      console.error("Error purging user sessions:", sessionsError);
    } else {
      console.log(`Purged ${sessionsDeleted} old user sessions`);
    }

    // Anonymize old audit IPs (default: 30 days)
    const { data: ipsAnonymized, error: ipsError } = await supabase.rpc(
      "anonymize_old_audit_ips",
      { days_threshold: 30 }
    );

    if (ipsError) {
      console.error("Error anonymizing audit IPs:", ipsError);
    } else {
      console.log(`Anonymized ${ipsAnonymized} old audit log IPs`);
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      sessions_deleted: sessionsDeleted ?? 0,
      ips_anonymized: ipsAnonymized ?? 0,
    };

    console.log("Data retention cleanup completed:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Data retention cleanup failed:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
