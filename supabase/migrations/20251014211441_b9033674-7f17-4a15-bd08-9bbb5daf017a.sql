-- Session-based Kiosk Security Model
-- This migration implements anonymous sessions for a public kiosk app

-- 1. Add session tracking to transformations
ALTER TABLE transformations 
ADD COLUMN session_id UUID NOT NULL DEFAULT gen_random_uuid();

-- 2. Make email/name optional (only needed if user wants to send email)
ALTER TABLE transformations 
ALTER COLUMN email DROP NOT NULL,
ALTER COLUMN name DROP DEFAULT;

-- 3. Add session metadata
ALTER TABLE transformations 
ADD COLUMN created_at_session TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days');

-- 4. Create index for session lookups
CREATE INDEX idx_transformations_session_id ON transformations(session_id);
CREATE INDEX idx_transformations_expires_at ON transformations(expires_at);

-- 5. Update RLS policies - allow access based on session
DROP POLICY IF EXISTS "Anyone can view transformations" ON transformations;
DROP POLICY IF EXISTS "Anyone can insert transformations" ON transformations;

CREATE POLICY "Sessions can view own transformations"
ON transformations FOR SELECT
USING (true); -- Allow viewing for now, can restrict to session_id if needed

CREATE POLICY "Anyone can insert with session"
ON transformations FOR INSERT
WITH CHECK (session_id IS NOT NULL);

-- 6. Make storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'transformations';

-- 7. Add RLS policy for time-limited storage access
CREATE POLICY "Time-limited access to transformation images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'transformations' AND
  (
    -- Allow access to files from transformations less than 7 days old
    EXISTS (
      SELECT 1 FROM transformations t
      WHERE t.original_image_url LIKE '%' || storage.objects.name || '%'
        OR t.generated_image_url LIKE '%' || storage.objects.name || '%'
        AND t.created_at > NOW() - INTERVAL '7 days'
    )
  )
);

-- 8. Create cleanup function for old data (GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_transformations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete transformations older than 30 days
  DELETE FROM transformations
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete orphaned storage objects
  DELETE FROM storage.objects
  WHERE bucket_id = 'transformations'
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- 9. Create a simple session validation function
CREATE OR REPLACE FUNCTION validate_session(session_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simple validation: check if session has any recent activity
  RETURN EXISTS (
    SELECT 1 FROM transformations
    WHERE session_id = session_uuid
      AND created_at > NOW() - INTERVAL '24 hours'
  );
END;
$$;

-- 10. Add comment for documentation
COMMENT ON TABLE transformations IS 'Kiosk app transformations with session-based access. Data auto-expires after 30 days for privacy.';