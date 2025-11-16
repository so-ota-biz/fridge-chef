/**
 * カテゴリ
 */
export interface Category {
  id: number
  name: string
  icon: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * GET /categories のレスポンス型
 */
export type CategoriesResponse = Category[]
