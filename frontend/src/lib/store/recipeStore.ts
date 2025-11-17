'use client'

import { create } from 'zustand'
import type { RecipeGenerateResponse } from '@/types/recipe'

/**
 * レシピ生成結果ストアの状態型
 */
interface RecipeStoreState {
  // 状態
  generatedRecipes: RecipeGenerateResponse | null

  // アクション
  setGeneratedRecipes: (recipes: RecipeGenerateResponse) => void
  clearGeneratedRecipes: () => void
}

/**
 * レシピ生成結果管理ストア
 *
 * AIで生成されたレシピ一覧を保持する
 * - レシピ詳細から一覧に戻った時に再生成を防ぐ
 * - 条件変更時や食材変更時にクリアする
 */
export const useRecipeStore = create<RecipeStoreState>((set) => ({
  // --------------------
  // 初期状態
  // --------------------
  generatedRecipes: null,

  // --------------------
  // アクション: 生成結果を保存
  // --------------------
  setGeneratedRecipes: (recipes: RecipeGenerateResponse) => {
    set({ generatedRecipes: recipes })
  },

  // --------------------
  // アクション: 生成結果をクリア
  // --------------------
  clearGeneratedRecipes: () => {
    set({ generatedRecipes: null })
  },
}))
