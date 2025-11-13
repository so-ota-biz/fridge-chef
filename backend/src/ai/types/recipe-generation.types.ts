/**
 * レシピ生成AIのリクエスト型
 */
export interface RecipeGenerationPrompt {
  ingredients: string[] // 食材名のリスト
  genre?: number // ジャンル（0: 和食, 1: 洋食, 2: 中華, 3: エスニック, 4: その他）
  difficulty?: number // 難易度（1: 超簡単, 2: 普通, 3: ちょっと頑張る）
  cookingTime?: number // 調理時間（分）
  servings?: number // 何人分
}

/**
 * AIが生成するレシピの材料
 */
export interface AIGeneratedPortion {
  ingredientName: string // 食材名（マスタにあればマスタの名前、なければ自由入力）
  amount: string // 分量（例: "200g", "大さじ2"）
}

/**
 * AIが生成するレシピの手順
 */
export interface AIGeneratedStep {
  stepNumber: number // 手順番号
  instruction: string // 手順の説明
  tips?: string // コツ・ポイント
}

/**
 * AIが生成する1つのレシピ
 */
export interface AIGeneratedRecipe {
  title: string
  description: string
  cookingTime: number // 分単位
  difficulty: number // 1-3
  servings: number // 何人分
  genre: number // 0-4
  calories?: number // 概算カロリー
  portions: AIGeneratedPortion[]
  steps: AIGeneratedStep[]
  imagePrompt: string // DALL-E用のプロンプト
}

/**
 * AIが生成する3つのレシピセット
 */
export interface AIRecipeGenerationResult {
  recipes: AIGeneratedRecipe[]
}
