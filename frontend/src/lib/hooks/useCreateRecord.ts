import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRecord } from '@/lib/api/record'
import type { CreateRecordRequest } from '@/types/record'

/**
 * 調理記録作成Hook
 */
export const useCreateRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRecordRequest) => createRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
    },
  })
}
