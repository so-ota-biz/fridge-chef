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
  (
    user_profiles up
    JOIN auth.users au ON ((up.id = au.id))
  );