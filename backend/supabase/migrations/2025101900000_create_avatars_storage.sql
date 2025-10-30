-- ===================================================
-- Create avatars bucket for user images
-- ===================================================

-- 既存ポリシーを削除（冪等性確保のため）
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- バケット作成（公開バケット）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- 公開バケット
  5242880,  -- 5MB制限
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']  -- 許可する画像形式
)
ON CONFLICT (id) DO NOTHING;

-- ===================================================
-- Storage Policies for avatars bucket
-- ===================================================

-- 1. 公開読み取り（誰でも画像を見られる）
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 2. 認証ユーザーのアップロード
-- ファイルパス: avatars/{user_id}/filename.ext
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. 自分のファイルの更新
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. 自分のファイルの削除
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);