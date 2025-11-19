'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { generateRecipes } from '@/lib/api/recipes'
import type { RecipeGenerateRequest, RecipeGenerateResponse } from '@/types/recipe'

/**
 * レシピ生成フック
 *
 * POST /recipes/generate を実行し、AIでレシピを生成する
 *
 * @returns TanStack Query の useMutation 結果
 */
export const useRecipeGeneration = () => {
  const queryClient = useQueryClient()
  return useMutation<RecipeGenerateResponse, Error, RecipeGenerateRequest>({
    mutationFn: generateRecipes,
    retry: false, // 自動リトライなし（手動リトライのみ）
    gcTime: Infinity,
    mutationKey: ['generateRecipes'],
    onSuccess: (data) => {
      queryClient.setQueryData(['generatedRecipes'], data)
    },
  })
}
