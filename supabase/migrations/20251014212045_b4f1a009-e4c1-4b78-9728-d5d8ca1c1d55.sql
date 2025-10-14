-- GDPR Compliance: Decouple images from personal information
-- Photos are only sent via email, NOT stored with PII in database

-- 1. Drop the storage RLS policy that depends on image URL columns
DROP POLICY IF EXISTS "Time-limited access to transformation images" ON storage.objects;

-- 2. Drop the image URL columns from transformations table
ALTER TABLE transformations 
DROP COLUMN IF EXISTS original_image_url,
DROP COLUMN IF EXISTS generated_image_url;

-- 3. Update table comment
COMMENT ON TABLE transformations IS 'Kiosk app analytics - NO PHOTOS stored, only session metadata. Email/name only if user opts in. Auto-deletes after 7 days for GDPR compliance.';

-- 4. Add transformation_type for basic analytics
ALTER TABLE transformations 
ADD COLUMN IF NOT EXISTS transformation_type TEXT;

-- 5. Update cleanup function - more aggressive: images deleted after 1 day, metadata after 7 days
CREATE OR REPLACE FUNCTION cleanup_old_transformations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete transformation records older than 7 days
  DELETE FROM transformations
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Delete ALL storage objects older than 1 day
  -- Images should only exist temporarily while email is being sent
  DELETE FROM storage.objects
  WHERE bucket_id = 'transformations'
    AND created_at < NOW() - INTERVAL '1 day';
    
  RAISE NOTICE 'Cleanup completed: Deleted old transformations and temporary images';
END;
$$;

COMMENT ON FUNCTION cleanup_old_transformations() IS 'GDPR cleanup: Deletes analytics after 7 days, temporary images after 1 day. Run this daily via cron or manually.';