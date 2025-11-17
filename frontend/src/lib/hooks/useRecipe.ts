'use client'

import { useQuery } from '@tanstack/react-query'
import { getRecipe } from '@/lib/api/recipes'
import type { RecipeDetailResponse } from '@/types/recipe'

/**
 * レシピ詳細取得フック
 *
 * GET /recipes/:id を実行し、レシピ詳細を取得する
 *
 * @param id - レシピID
 * @returns TanStack Query の useQuery 結果
 */
export const useRecipe = (id: number) => {
  return useQuery<RecipeDetailResponse, Error>({
    queryKey: ['recipe', id],
    queryFn: () => getRecipe(id),
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
    gcTime: 1000 * 60 * 30, // 30分キャッシュを保持
  })
}
