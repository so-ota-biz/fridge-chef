import { Record as PrismaRecord, Recipe as PrismaRecipe } from '@prisma/client'

/**
 * 調理記録レスポンス型
 */
export type RecordResponse = PrismaRecord

/**
 * レシピ情報を含む調理記録レスポンス型
 */
export type RecordWithRecipeResponse = PrismaRecord & {
  recipe: PrismaRecipe | null
}

/**
 * 調理記録一覧レスポンス型
 */
export interface RecordsListResponse {
  records: RecordWithRecipeResponse[]
  total: number
}
