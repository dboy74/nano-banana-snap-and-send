-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Schedule daily cleanup at 2 AM UTC
SELECT cron.schedule(
  'daily-cleanup-transformations',
  '0 2 * * *', -- Every day at 2 AM UTC
  $$
  SELECT public.cleanup_old_transformations();
  $$
);