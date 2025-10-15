-- Update cleanup function to delete transformations after 30 days
-- but keep image deletion at 1 day
CREATE OR REPLACE FUNCTION public.cleanup_old_transformations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete transformation records older than 30 days
  DELETE FROM transformations
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete ALL storage objects older than 1 day
  -- Images should only exist temporarily while email is being sent
  DELETE FROM storage.objects
  WHERE bucket_id = 'transformations'
    AND created_at < NOW() - INTERVAL '1 day';
    
  RAISE NOTICE 'Cleanup completed: Deleted transformations older than 30 days and images older than 1 day';
END;
$function$;