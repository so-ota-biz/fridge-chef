/**
 * レシピのジャンル定義
 */
export enum RecipeGenre {
  JAPANESE = 0, // 和食
  WESTERN = 1, // 洋食
  CHINESE = 2, // 中華
  ETHNIC = 3, // エスニック
  OTHER = 4, // その他
}

/**
 * ジャンル名の日本語表示用マッピング
 */
export const RECIPE_GENRE_LABELS: Record<RecipeGenre, string> = {
  [RecipeGenre.JAPANESE]: '和食',
  [RecipeGenre.WESTERN]: '洋食',
  [RecipeGenre.CHINESE]: '中華',
  [RecipeGenre.ETHNIC]: 'エスニック',
  [RecipeGenre.OTHER]: 'その他',
}

/**
 * レシピの難易度定義
 */
export enum RecipeDifficulty {
  VERY_EASY = 1, // 超簡単
  NORMAL = 2, // 普通
  HARD = 3, // ちょっと頑張る
}

/**
 * 難易度の日本語表示用マッピング
 */
export const RECIPE_DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  [RecipeDifficulty.VERY_EASY]: '超簡単',
  [RecipeDifficulty.NORMAL]: '普通',
  [RecipeDifficulty.HARD]: 'ちょっと頑張る',
}

/**
 * レシピの評価（1-5）
 */
export enum RecipeRating {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}
