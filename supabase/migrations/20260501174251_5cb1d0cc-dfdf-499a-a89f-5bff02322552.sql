
UPDATE tryout_events
SET ends_at = starts_at + INTERVAL '1 hour 15 minutes'
WHERE age_group = '9-12' AND starts_at >= now();

UPDATE tryout_events
SET starts_at = starts_at + INTERVAL '1 hour 15 minutes'
WHERE age_group = '13-17' AND starts_at >= now();
