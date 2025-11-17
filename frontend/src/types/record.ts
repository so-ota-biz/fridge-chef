import type { Recipe } from './recipe'

/**
 * 調理記録
 */
export interface Record {
  id: number
  userId: string
  recipeId: number
  cookedAt: string
  rating: number | null
  memo: string | null
  userImageUrl: string | null
  createdAt: string
  updatedAt: string
}

/**
 * レシピ情報を含む調理記録
 */
export interface RecordWithRecipe extends Record {
  recipe: Recipe | null
}

/**
 * 調理記録作成リクエスト
 */
export interface CreateRecordRequest {
  recipeId: number
}

/**
 * 調理記録更新リクエスト
 */
export interface UpdateRecordRequest {
  rating?: number | null
  memo?: string
}

/**
 * 調理記録一覧レスポンス
 */
export interface RecordsListResponse {
  records: RecordWithRecipe[]
  total: number
}

/**
 * 調理記録一覧クエリパラメータ
 */
export interface RecordQueryParams {
  limit?: number
  offset?: number
}
