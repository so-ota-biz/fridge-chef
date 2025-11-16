import { apiClient } from '@/lib/api/client'
import type { IngredientsResponse } from '@/types/ingredient'

/**
 * 食材一覧を取得
 *
 * GET /ingredients
 *
 * @returns 食材一覧
 */
export const getIngredients = async (): Promise<IngredientsResponse> => {
  const response = await apiClient.get<IngredientsResponse>('/ingredients')
  return response.data
}
