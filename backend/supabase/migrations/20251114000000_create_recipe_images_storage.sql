-- Create recipe-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-images',
  'recipe-images',
  true, -- パブリックアクセス可能
  5242880, -- 5MB制限
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Allow authenticated users to upload recipe images
CREATE POLICY "Authenticated users can upload recipe images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recipe-images');

-- Allow public read access to recipe images
CREATE POLICY "Public read access to recipe images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'recipe-images');

-- Allow authenticated users to delete their own recipe images (for future cleanup)
CREATE POLICY "Authenticated users can delete recipe images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'recipe-images');