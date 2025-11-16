import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateRecord } from '@/lib/api/record'
import type { UpdateRecordRequest } from '@/types/record'

/**
 * 調理記録更新Hook
 */
export const useUpdateRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRecordRequest }) => updateRecord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['record', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['records'] })
    },
  })
}
