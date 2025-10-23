-- ===================================================
-- Create users table and related functions
-- ===================================================

-- users テーブル作成
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_users_display_name ON public.users(display_name);

-- RLS有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 自分のレコードのみ読み取り可能
CREATE POLICY "Users can view their own record"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- RLSポリシー: 自分のレコードのみ更新可能
CREATE POLICY "Users can update their own record"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ===================================================
-- Trigger Functions
-- ===================================================

-- updated_at 自動更新トリガー関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- auth.users 作成時に public.users も作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, first_name, last_name)
  VALUES (NEW.id, NULL, NULL, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 削除時に public.users も削除
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================
-- Triggers
-- ===================================================

-- updated_at 自動更新トリガー
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- auth.users 作成時トリガー
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- auth.users 削除時トリガー
CREATE TRIGGER on_auth_user_deleted
AFTER DELETE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_delete_user();
