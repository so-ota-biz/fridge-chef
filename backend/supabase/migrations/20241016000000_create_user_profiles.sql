-- user_profiles テーブルの作成
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    is_premium BOOLEAN DEFAULT false NOT NULL,
    premium_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- インデックスの作成
CREATE INDEX idx_user_profiles_display_name ON public.user_profiles(display_name);
CREATE INDEX idx_user_profiles_premium ON public.user_profiles(is_premium, premium_expires_at);

-- ユーザープロフィールとauth.usersを結合したビュー
CREATE VIEW public.user_profile_view AS
SELECT 
    up.id,
    au.email,
    up.display_name,
    up.first_name,
    up.last_name,
    up.avatar_url,
    up.is_premium,
    up.premium_expires_at,
    au.email_confirmed_at,
    au.last_sign_in_at,
    up.created_at,
    up.updated_at
FROM 
    public.user_profiles up
    INNER JOIN auth.users au ON up.id = au.id;

-- RLSポリシー（ビューにも適用可能）
ALTER VIEW public.user_profile_view SET (security_invoker = on);
-- RLS (Row Level Security) の有効化
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のプロフィールのみ閲覧可能
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- ポリシー: ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- トリガー関数: auth.users 作成時に user_profiles を自動作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー: auth.users への INSERT 時に実行
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- updated_at 自動更新用のトリガー関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 自動更新トリガー
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();