
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('merchant-avatars', 'merchant-avatars', true);

-- Anyone can view avatars (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'merchant-avatars');

-- Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'merchant-avatars');

-- Authenticated users can update their own avatars
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'merchant-avatars');

-- Authenticated users can delete their own avatars
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'merchant-avatars');
