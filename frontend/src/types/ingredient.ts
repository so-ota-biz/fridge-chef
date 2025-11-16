/**
 * 食材
 * GET /ingredients のレスポンス型
 */
export interface Ingredient {
  id: number
  name: string
  categoryId: number
  icon: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * GET /ingredients のレスポンス型
 */
export type IngredientsResponse = Ingredient[]
