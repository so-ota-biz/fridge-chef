import { apiClient } from '@/lib/api/client'
import type { CategoriesResponse } from '@/types/category'

/**
 * カテゴリ一覧を取得
 *
 * GET /categories
 *
 * @returns カテゴリ一覧
 */
export const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await apiClient.get<CategoriesResponse>('/categories')
  return response.data
}
