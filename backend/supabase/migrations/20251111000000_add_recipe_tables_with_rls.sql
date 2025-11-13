-- CreateTable: categories
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_categories_sort_order" ON "categories"("sort_order");

-- CreateTable: ingredients
CREATE TABLE "ingredients" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_ingredients_category_id" ON "ingredients"("category_id");
CREATE INDEX "idx_ingredients_sort_order" ON "ingredients"("sort_order");

-- CreateTable: recipes
CREATE TABLE "recipes" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "cooking_time" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "servings" INTEGER NOT NULL,
    "image_url" VARCHAR(255),
    "image_prompt" TEXT,
    "genre" INTEGER NOT NULL,
    "calories" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_recipes_genre" ON "recipes"("genre");
CREATE INDEX "idx_recipes_difficulty" ON "recipes"("difficulty");
CREATE INDEX "idx_recipes_cooking_time" ON "recipes"("cooking_time");

-- CreateTable: portions
CREATE TABLE "portions" (
    "id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER,
    "name" VARCHAR(100),
    "amount" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_portions_recipe_id" ON "portions"("recipe_id");
CREATE INDEX "idx_portions_ingredient_id" ON "portions"("ingredient_id");

-- CreateTable: steps
CREATE TABLE "steps" (
    "id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "step_number" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "tips" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_steps_recipe_id_step_number" ON "steps"("recipe_id", "step_number");

-- CreateTable: records
CREATE TABLE "records" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "user_image_url" VARCHAR(255),
    "rating" INTEGER,
    "memo" TEXT,
    "cooked_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_records_user_id" ON "records"("user_id");
CREATE INDEX "idx_records_recipe_id" ON "records"("recipe_id");
CREATE INDEX "idx_records_cooked_at" ON "records"("cooked_at");

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portions" ADD CONSTRAINT "portions_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portions" ADD CONSTRAINT "portions_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "steps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- RLS (Row Level Security) Configuration
-- ============================================

-- Enable RLS for records table only
ALTER TABLE "records" ENABLE ROW LEVEL SECURITY;

-- Policy: ユーザーは自分の記録のみ閲覧可能
CREATE POLICY "Users can view own records"
  ON "records"
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: ユーザーは自分の記録のみ作成可能
CREATE POLICY "Users can insert own records"
  ON "records"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: ユーザーは自分の記録のみ更新可能
CREATE POLICY "Users can update own records"
  ON "records"
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: ユーザーは自分の記録のみ削除可能
CREATE POLICY "Users can delete own records"
  ON "records"
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE "categories" IS '食材カテゴリマスタ（RLS無効：全ユーザー共通の読み取り専用データ）';
COMMENT ON TABLE "ingredients" IS '食材マスタ（RLS無効：全ユーザー共通の読み取り専用データ）';
COMMENT ON TABLE "recipes" IS 'レシピテンプレート（RLS無効：user_idを持たない共有データ）';
COMMENT ON TABLE "portions" IS 'レシピの材料（RLS無効：recipesに紐づく公開データ）';
COMMENT ON TABLE "steps" IS '調理手順（RLS無効：recipesに紐づく公開データ）';
COMMENT ON TABLE "records" IS '調理記録（RLS有効：ユーザー個人データ）';