import { useQuery } from '@tanstack/react-query'
import { getRecord } from '@/lib/api/record'

/**
 * 調理記録詳細取得Hook
 */
export const useRecord = (id: number) => {
  return useQuery({
    queryKey: ['record', id],
    queryFn: () => getRecord(id),
    enabled: !!id,
  })
}
