-- Create storage bucket for transformations
INSERT INTO storage.buckets (id, name, public)
VALUES ('transformations', 'transformations', true);

-- Create RLS policies for the transformations bucket
CREATE POLICY "Anyone can view transformation images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'transformations');

CREATE POLICY "Anyone can upload transformation images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'transformations');

-- Add image URL columns to transformations table
ALTER TABLE public.transformations
ADD COLUMN original_image_url TEXT,
ADD COLUMN generated_image_url TEXT;