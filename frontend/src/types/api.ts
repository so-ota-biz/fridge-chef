/**
 * APIエラーレスポンス
 */
export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error: string
}

/**
 * APIレスポンスの基本型
 */
export type ApiResponse<T> = T

/**
 * ページネーション情報
 */
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * ページネーション付きレスポンス
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}
