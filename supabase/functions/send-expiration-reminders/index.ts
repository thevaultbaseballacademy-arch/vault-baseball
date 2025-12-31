import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const certificationNames: Record<string, string> = {
  foundations: "Foundations",
  performance: "Performance",
  catcher_specialist: "Catcher Specialist",
  infield_specialist: "Infield Specialist",
  outfield_specialist: "Outfield Specialist",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[EXPIRATION-REMINDER] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting expiration reminder check");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date 30 days from now
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    // Start of that day
    const startOfDay = new Date(thirtyDaysFromNow);
    startOfDay.setHours(0, 0, 0, 0);
    
    // End of that day
    const endOfDay = new Date(thirtyDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    logStep("Checking for certifications expiring around", { 
      date: thirtyDaysFromNow.toISOString(),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });

    // Find certifications expiring in approximately 30 days that haven't had reminder sent
    const { data: expiringCerts, error: fetchError } = await supabase
      .from("user_certifications")
      .select(`
        id,
        user_id,
        certification_type,
        expires_at,
        certificate_number
      `)
      .eq("status", "active")
      .eq("expiration_reminder_sent", false)
      .gte("expires_at", startOfDay.toISOString())
      .lte("expires_at", endOfDay.toISOString());

    if (fetchError) {
      logStep("Error fetching expiring certifications", { error: fetchError });
      throw fetchError;
    }

    logStep("Found expiring certifications", { count: expiringCerts?.length || 0 });

    if (!expiringCerts || expiringCerts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No expiring certifications found", reminders_sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let remindersSent = 0;
    const errors: string[] = [];

    for (const cert of expiringCerts) {
      try {
        // Get user profile for email and name
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email, display_name")
          .eq("user_id", cert.user_id)
          .single();

        if (profileError || !profile?.email) {
          logStep("Could not find profile for user", { userId: cert.user_id, error: profileError });
          continue;
        }

        const certName = certificationNames[cert.certification_type] || cert.certification_type;
        const expiryDate = new Date(cert.expires_at).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        logStep("Sending reminder email", { 
          email: profile.email, 
          certification: certName,
          expiryDate 
        });

        const emailResponse = await resend.emails.send({
          from: "The Vault <onboarding@resend.dev>",
          to: [profile.email],
          subject: `⚠️ Your ${certName} Certification Expires in 30 Days`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; margin: 0; padding: 40px 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #1a1a2e 0%, #0f0f23 100%); border-radius: 16px; overflow: hidden; border: 1px solid #c9a227;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #c9a227 0%, #a88a1e 100%); padding: 32px; text-align: center;">
                  <h1 style="color: #0a0a0a; margin: 0; font-size: 28px; font-weight: bold;">
                    ⚠️ Certification Expiring Soon
                  </h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 32px;">
                  <p style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0;">
                    Hi ${profile.display_name || "Coach"},
                  </p>
                  
                  <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Your <strong style="color: #c9a227;">${certName}</strong> certification is set to expire on:
                  </p>
                  
                  <div style="background: rgba(201, 162, 39, 0.1); border: 1px solid #c9a227; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
                    <p style="color: #c9a227; font-size: 24px; font-weight: bold; margin: 0;">
                      ${expiryDate}
                    </p>
                    ${cert.certificate_number ? `<p style="color: #666; font-size: 14px; margin: 8px 0 0 0;">Certificate #${cert.certificate_number}</p>` : ""}
                  </div>
                  
                  <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    To maintain your certified status and continue demonstrating your expertise, please renew your certification before it expires.
                  </p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="https://thevault.coach/certifications" style="display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #a88a1e 100%); color: #0a0a0a; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Renew Certification
                    </a>
                  </div>
                  
                  <div style="border-top: 1px solid #333; padding-top: 24px; margin-top: 32px;">
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                      <strong style="color: #c9a227;">Why Renew?</strong><br>
                      • Maintain your verified coach status<br>
                      • Keep access to exclusive resources<br>
                      • Stay current with the latest methodologies<br>
                      • Continue building trust with athletes and parents
                    </p>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background: #0a0a0a; padding: 24px; text-align: center; border-top: 1px solid #222;">
                  <p style="color: #666; font-size: 12px; margin: 0;">
                    The Vault Baseball Training<br>
                    Questions? Reply to this email for support.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        logStep("Email sent successfully", { response: emailResponse });

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from("user_certifications")
          .update({
            expiration_reminder_sent: true,
            expiration_reminder_sent_at: new Date().toISOString(),
          })
          .eq("id", cert.id);

        if (updateError) {
          logStep("Error updating certification reminder status", { error: updateError });
          errors.push(`Failed to update status for cert ${cert.id}`);
        } else {
          remindersSent++;
        }
      } catch (emailError: unknown) {
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
        logStep("Error sending email for certification", { certId: cert.id, error: errorMessage });
        errors.push(`Failed to send email for cert ${cert.id}: ${errorMessage}`);
      }
    }

    logStep("Completed expiration reminder process", { remindersSent, errors });

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders_sent: remindersSent,
        total_found: expiringCerts.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error in expiration reminder function", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
