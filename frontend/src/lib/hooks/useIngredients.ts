'use client'

import { useQuery } from '@tanstack/react-query'
import { getIngredients } from '@/lib/api/ingredients'
import type { IngredientsResponse } from '@/types/ingredient'

/**
 * 食材一覧取得フック
 *
 * GET /ingredients を実行し、食材一覧を取得する
 *
 * @returns TanStack Query の useQuery 結果
 */
export const useIngredients = () => {
  return useQuery<IngredientsResponse, Error>({
    queryKey: ['ingredients'],
    queryFn: getIngredients,
    staleTime: 1000 * 60 * 30, // 30分間はキャッシュを使用
    gcTime: 1000 * 60 * 60, // 1時間キャッシュを保持
  })
}
