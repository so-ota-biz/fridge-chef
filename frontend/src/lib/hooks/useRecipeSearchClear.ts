'use client'

import { useIngredientStore, useConditionStore, useRecipeStore } from '@/lib/store'

/**
 * レシピ検索関連の状態を一括クリアするフック
 *
 * 以下のタイミングで使用することを想定：
 * - ログアウト時
 * - レシピ採用（調理記録作成）時
 * - 新規レシピ検索開始時
 *
 * @returns clearRecipeSearch - レシピ検索関連の全ストアをクリアする関数
 */
export const useRecipeSearchClear = () => {
  const clearIngredients = useIngredientStore((state) => state.clearIngredients)
  const clearConditions = useConditionStore((state) => state.clearConditions)
  const clearGeneratedRecipes = useRecipeStore((state) => state.clearGeneratedRecipes)

  const clearRecipeSearch = () => {
    clearIngredients()
    clearConditions()
    clearGeneratedRecipes()
  }

  return clearRecipeSearch
}
