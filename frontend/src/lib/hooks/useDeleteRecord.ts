import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteRecord } from '@/lib/api/record'

/**
 * 調理記録削除Hook
 */
export const useDeleteRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
    },
  })
}
