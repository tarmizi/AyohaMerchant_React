
-- Create storage bucket for stamp card design assets
INSERT INTO storage.buckets (id, name, public) VALUES ('stampcard-assets', 'stampcard-assets', true);

-- Policies for stampcard-assets bucket
CREATE POLICY "Authenticated users can upload stampcard assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'stampcard-assets');

CREATE POLICY "Anyone can view stampcard assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'stampcard-assets');

CREATE POLICY "Users can update own stampcard assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'stampcard-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own stampcard assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'stampcard-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
