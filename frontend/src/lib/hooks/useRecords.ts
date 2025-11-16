import { useQuery } from '@tanstack/react-query'
import { getRecords } from '@/lib/api/record'
import type { RecordQueryParams } from '@/types/record'

/**
 * 調理記録一覧取得Hook
 */
export const useRecords = (params?: RecordQueryParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['records', params],
    queryFn: () => getRecords(params),
    enabled: options?.enabled ?? true, // デフォルトは有効
  })
}
