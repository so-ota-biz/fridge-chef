import { Record as PrismaRecord } from '@prisma/client'

/**
 * 調理記録レスポンス型
 */
export type RecordResponse = PrismaRecord

/**
 * 調理記録一覧レスポンス型
 */
export interface RecordsListResponse {
  records: RecordResponse[]
  total: number
}
