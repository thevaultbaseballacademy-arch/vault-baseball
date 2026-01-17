import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeletionRequest {
  id: string;
  user_id: string;
  user_email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    console.log('Starting data purge for approved deletion requests...');

    // Fetch all approved deletion requests
    const { data: requests, error: fetchError } = await supabaseAdmin
      .from('data_deletion_requests')
      .select('id, user_id, user_email')
      .eq('status', 'approved');

    if (fetchError) {
      console.error('Error fetching requests:', fetchError);
      throw fetchError;
    }

    if (!requests || requests.length === 0) {
      console.log('No approved deletion requests to process');
      return new Response(
        JSON.stringify({ message: 'No approved requests to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${requests.length} approved deletion requests`);

    const results: { userId: string; success: boolean; error?: string }[] = [];

    for (const request of requests as DeletionRequest[]) {
      console.log(`Processing deletion for user: ${request.user_id}`);
      
      try {
        // Delete data from all user-related tables in order (respecting foreign keys)
        const tablesToPurge = [
          // Dependent tables first
          { table: 'notification_analytics', column: 'user_id' },
          { table: 'notifications', column: 'user_id' },
          { table: 'community_likes', column: 'user_id' },
          { table: 'community_comments', column: 'user_id' },
          { table: 'community_posts', column: 'user_id' },
          { table: 'question_results', column: 'attempt_id', subquery: true },
          { table: 'certification_attempts', column: 'user_id' },
          { table: 'user_certifications', column: 'user_id' },
          { table: 'course_progress', column: 'user_id' },
          { table: 'course_enrollments', column: 'user_id' },
          { table: 'course_certificates', column: 'user_id' },
          { table: 'athlete_checkins', column: 'user_id' },
          { table: 'athlete_kpis', column: 'user_id' },
          { table: 'athlete_kpi_goals', column: 'user_id' },
          { table: 'athletic_stats', column: 'user_id' },
          { table: 'highlight_videos', column: 'user_id' },
          { table: 'kpi_share_tokens', column: 'user_id' },
          { table: 'coaching_sessions', column: 'user_id' },
          { table: 'coach_athlete_assignments', column: 'athlete_user_id' },
          { table: 'coach_kpi_comments', column: 'athlete_user_id' },
          { table: 'coach_alerts', column: 'athlete_user_id' },
          { table: 'schedule_assignments', column: 'athlete_user_id' },
          { table: 'user_purchases', column: 'user_id' },
          { table: 'user_sessions', column: 'user_id' },
          { table: 'push_tokens', column: 'user_id' },
          { table: 'mfa_backup_codes', column: 'user_id' },
          { table: 'notification_preferences', column: 'user_id' },
          { table: 'user_roles', column: 'user_id' },
          { table: 'profiles', column: 'user_id' },
        ];

        let deletedCount = 0;

        for (const { table, column } of tablesToPurge) {
          try {
            const { error: deleteError, count } = await supabaseAdmin
              .from(table)
              .delete({ count: 'exact' })
              .eq(column, request.user_id);

            if (deleteError) {
              console.warn(`Warning: Could not delete from ${table}:`, deleteError.message);
            } else {
              deletedCount += count || 0;
              if (count && count > 0) {
                console.log(`Deleted ${count} records from ${table}`);
              }
            }
          } catch (tableError) {
            console.warn(`Warning: Error deleting from ${table}:`, tableError);
          }
        }

        // Also delete any coach-related data where user is a coach
        const coachTables = [
          { table: 'coach_athlete_assignments', column: 'coach_user_id' },
          { table: 'coach_kpi_comments', column: 'coach_user_id' },
          { table: 'coach_alerts', column: 'coach_user_id' },
          { table: 'custom_training_schedules', column: 'coach_user_id' },
        ];

        for (const { table, column } of coachTables) {
          try {
            const { error: deleteError } = await supabaseAdmin
              .from(table)
              .delete()
              .eq(column, request.user_id);

            if (deleteError) {
              console.warn(`Warning: Could not delete coach data from ${table}:`, deleteError.message);
            }
          } catch (tableError) {
            console.warn(`Warning: Error deleting coach data from ${table}:`, tableError);
          }
        }

        // Anonymize audit logs instead of deleting (for compliance)
        const { error: auditError } = await supabaseAdmin
          .from('audit_logs')
          .update({ 
            changed_by: null, 
            ip_address: 'DELETED',
            user_agent: 'DELETED'
          })
          .eq('changed_by', request.user_id);

        if (auditError) {
          console.warn('Warning: Could not anonymize audit logs:', auditError.message);
        }

        // Mark the deletion request as completed
        const { error: updateError } = await supabaseAdmin
          .from('data_deletion_requests')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            admin_notes: `Automated purge completed. Deleted records from ${deletedCount} entries across all tables.`,
          })
          .eq('id', request.id);

        if (updateError) {
          console.error('Error updating request status:', updateError);
          throw updateError;
        }

        console.log(`Successfully purged data for user: ${request.user_id}`);
        results.push({ userId: request.user_id, success: true });

      } catch (userError: any) {
        console.error(`Error processing user ${request.user_id}:`, userError);
        results.push({ 
          userId: request.user_id, 
          success: false, 
          error: userError.message 
        });

        // Update request with error note
        await supabaseAdmin
          .from('data_deletion_requests')
          .update({
            admin_notes: `Automated purge failed: ${userError.message}. Manual intervention required.`,
          })
          .eq('id', request.id);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Purge complete. Success: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({
        message: 'Data purge completed',
        processed: requests.length,
        success: successCount,
        failed: failCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Data purge error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process deletion requests' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
