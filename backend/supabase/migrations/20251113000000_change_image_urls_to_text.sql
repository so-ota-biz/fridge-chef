-- 画像URLをTEXT型に変更（長いURLに対応）

ALTER TABLE recipes 
ALTER COLUMN image_url TYPE TEXT;

ALTER TABLE steps 
ALTER COLUMN image_url TYPE TEXT;

ALTER TABLE users 
ALTER COLUMN avatar_url TYPE TEXT;

ALTER TABLE records 
ALTER COLUMN user_image_url TYPE TEXT;