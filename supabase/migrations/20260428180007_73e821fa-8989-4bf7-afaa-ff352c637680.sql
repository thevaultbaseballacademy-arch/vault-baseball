
DO $$
DECLARE
  v_url text;
  v_key text;
BEGIN
  -- Reuse existing service-role secret stored by email infra setup
  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;
  v_url := 'https://hhvdxkxaiauzikavtpuj.supabase.co/functions/v1/tryout-reminders';

  -- Drop any prior job
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'tryout-reminders-daily';

  PERFORM cron.schedule(
    'tryout-reminders-daily',
    '0 18 * * *',
    format(
      $job$
      SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || %L),
        body := '{}'::jsonb
      );
      $job$,
      v_url, v_key
    )
  );
END $$;
