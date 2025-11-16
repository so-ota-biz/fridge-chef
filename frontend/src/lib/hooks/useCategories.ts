'use client'

import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/lib/api/categories'
import type { CategoriesResponse } from '@/types/category'

/**
 * カテゴリ一覧取得フック
 *
 * GET /categories を実行し、カテゴリ一覧を取得する
 *
 * @returns TanStack Query の useQuery 結果
 */
export const useCategories = () => {
  return useQuery<CategoriesResponse, Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30, // 30分間はキャッシュを使用
    gcTime: 1000 * 60 * 60, // 1時間キャッシュを保持
  })
}
