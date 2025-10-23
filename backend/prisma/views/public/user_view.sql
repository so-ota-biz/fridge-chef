SELECT
  u.id,
  u.display_name,
  u.first_name,
  u.last_name,
  u.avatar_url,
  u.created_at,
  u.updated_at,
  au.email,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM
  (
    users u
    LEFT JOIN auth.users au ON ((u.id = au.id))
  );