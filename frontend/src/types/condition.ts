/**
 * 条件設定
 */

/**
 * ジャンル（Enum値）
 * バックエンドのrecipes.genreフィールドに対応
 */
export enum RecipeGenre {
  JAPANESE = 0, // 和食
  WESTERN = 1, // 洋食
  CHINESE = 2, // 中華
  ETHNIC = 3, // エスニック
  OTHER = 4, // その他
}

/**
 * 難易度（1-3）
 * バックエンドのrecipes.difficultyフィールドに対応
 */
export enum RecipeDifficulty {
  EASY = 1, // 超簡単
  MEDIUM = 2, // 普通
  HARD = 3, // ちょっと頑張る
}

/**
 * 調理時間（分）
 */
export enum CookingTime {
  SHORT = 15, // 15分以内
  MEDIUM = 30, // 30分以内
  LONG = 60, // こだわり（60分以上）
}

/**
 * レシピ生成条件
 */
export interface RecipeConditions {
  ingredients: string[] // 食材名の配列（マスタ + 自由入力）
  genre: RecipeGenre // ジャンル
  difficulty: RecipeDifficulty // 難易度
  cookingTime: CookingTime // 調理時間
  servings: number // 人数
}
