/**
 * レシピ型定義
 *
 * バックエンドのrecipesテーブルに対応
 */

import type { Portion } from './portion'
import type { Step } from './step'

/**
 * レシピ
 */
export interface Recipe {
  id: number
  title: string
  description: string | null
  cookingTime: number
  difficulty: number
  servings: number
  imageUrl: string | null
  imagePrompt: string | null
  genre: number
  calories: number | null
  createdAt: string
  updatedAt: string
  portions?: Portion[]
  steps?: Step[]
}

/**
 * POST /recipes/generate のリクエスト型
 */
export interface RecipeGenerateRequest {
  ingredients: string[] // 食材名の配列
  genre?: number
  difficulty?: number
  cookingTime?: number
  servings?: number
}

/**
 * POST /recipes/generate のレスポンス型
 */
export interface RecipeGenerateResponse {
  recipes: Recipe[]
}

/**
 * GET /recipes/:id のレスポンス型
 */
export type RecipeDetailResponse = Recipe
