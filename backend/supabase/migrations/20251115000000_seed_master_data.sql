-- ===================================================
-- Seed master data (idempotent upserts)
-- categories / ingredients
-- ===================================================

-- Categories
INSERT INTO public.categories (id, name, icon, sort_order) VALUES
  (1, '野菜', 'vegetables', 1),
  (2, '肉類', 'meat', 2),
  (3, '魚・海鮮', 'seafood', 3),
  (4, 'きのこ類', 'mushroom', 4),
  (5, '冷蔵庫の定番', 'refrigerator', 5),
  (6, 'その他', 'other', 6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Ingredients
INSERT INTO public.ingredients (id, name, category_id, icon, sort_order) VALUES
  -- 野菜（20）
  (1,  '玉ねぎ',       1, NULL, 1),
  (2,  'にんじん',     1, NULL, 2),
  (3,  'じゃがいも',   1, NULL, 3),
  (4,  'キャベツ',     1, NULL, 4),
  (5,  '白菜',         1, NULL, 5),
  (6,  'レタス',       1, NULL, 6),
  (7,  'トマト',       1, NULL, 7),
  (8,  'きゅうり',     1, NULL, 8),
  (9,  'なす',         1, NULL, 9),
  (10, 'ピーマン',     1, NULL, 10),
  (11, 'ブロッコリー', 1, NULL, 11),
  (12, 'ほうれん草',   1, NULL, 12),
  (13, '大根',         1, NULL, 13),
  (14, 'ねぎ',         1, NULL, 14),
  (15, 'もやし',       1, NULL, 15),
  (16, 'かぼちゃ',     1, NULL, 16),
  (17, 'アスパラガス', 1, NULL, 17),
  (18, 'さつまいも',   1, NULL, 18),
  (19, 'ごぼう',       1, NULL, 19),
  (20, 'れんこん',     1, NULL, 20),
  -- 肉類（9）
  (21, '豚肉（薄切り）', 2, NULL, 1),
  (22, '豚バラ',         2, NULL, 2),
  (23, '鶏もも肉',       2, NULL, 3),
  (24, '鶏むね肉',       2, NULL, 4),
  (25, '牛肉（薄切り）', 2, NULL, 5),
  (26, 'ひき肉',         2, NULL, 6),
  (27, 'ベーコン',       2, NULL, 7),
  (28, 'ウインナー',     2, NULL, 8),
  (29, 'ハム',           2, NULL, 9),
  -- 魚・海鮮（6）
  (30, '鮭',     3, NULL, 1),
  (31, 'さば',   3, NULL, 2),
  (32, 'あじ',   3, NULL, 3),
  (33, 'えび',   3, NULL, 4),
  (34, 'いか',   3, NULL, 5),
  (35, 'ツナ缶', 3, NULL, 6),
  -- きのこ類（4）
  (36, 'しいたけ', 4, NULL, 1),
  (37, 'しめじ',   4, NULL, 2),
  (38, 'えのき',   4, NULL, 3),
  (39, 'まいたけ', 4, NULL, 4),
  -- 冷蔵庫の定番（8）
  (40, '卵',         5, NULL, 1),
  (41, '牛乳',       5, NULL, 2),
  (42, '豆腐',       5, NULL, 3),
  (43, '納豆',       5, NULL, 4),
  (44, 'チーズ',     5, NULL, 5),
  (45, 'バター',     5, NULL, 6),
  (46, 'ヨーグルト', 5, NULL, 7),
  (47, 'こんにゃく', 5, NULL, 8),
  -- その他（3）
  (48, '油揚げ',   6, NULL, 1),
  (49, 'ちくわ',   6, NULL, 2),
  (50, 'かまぼこ', 6, NULL, 3)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- ===================================================
-- End of seed
-- ===================================================

