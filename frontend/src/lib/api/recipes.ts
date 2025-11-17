import { apiClient } from '@/lib/api/client'
import type {
  RecipeGenerateRequest,
  RecipeGenerateResponse,
  RecipeDetailResponse,
} from '@/types/recipe'

/**
 * レシピ生成
 *
 * POST /recipes/generate
 *
 * @param data - レシピ生成リクエストデータ
 * @returns 生成されたレシピ一覧
 */
export const generateRecipes = async (
  data: RecipeGenerateRequest,
): Promise<RecipeGenerateResponse> => {
  const response = await apiClient.post<RecipeGenerateResponse>('/recipes/generate', data, {
    timeout: 70000, // 70秒タイムアウト（レシピ生成は60秒程度かかる）
  })
  return response.data
}

/**
 * レシピ詳細を取得
 *
 * GET /recipes/:id
 *
 * @param id - レシピID
 * @returns レシピ詳細
 */
export const getRecipe = async (id: number): Promise<RecipeDetailResponse> => {
  const response = await apiClient.get<RecipeDetailResponse>(`/recipes/${id}`)
  return response.data
}

/**
 * レシピを削除
 *
 * DELETE /recipes/:id
 *
 * @param id - レシピID
 */
export const deleteRecipe = async (id: number): Promise<void> => {
  await apiClient.delete(`/recipes/${id}`)
}
