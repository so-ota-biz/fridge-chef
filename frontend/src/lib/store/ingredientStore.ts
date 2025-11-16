'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 食材選択ストアの状態型
 */
interface IngredientStoreState {
  // 状態
  selectedIngredients: string[] // 食材名の配列（マスタ選択 + 自由入力）

  // アクション
  addIngredient: (ingredientName: string) => void
  removeIngredient: (ingredientName: string) => void
  clearIngredients: () => void
  isSelected: (ingredientName: string) => boolean
}

/**
 * 食材選択状態管理ストア
 *
 * 選択した食材名を管理し、LocalStorageに永続化する
 * - マスタから選択した食材名
 * - ユーザーが自由入力した食材名
 */
export const useIngredientStore = create<IngredientStoreState>()(
  persist(
    (set, get) => ({
      // --------------------
      // 初期状態
      // --------------------
      selectedIngredients: [],

      // --------------------
      // アクション: 食材を追加
      // --------------------
      addIngredient: (ingredientName: string) => {
        const { selectedIngredients } = get()

        // トリミング
        const trimmedName = ingredientName.trim()
        if (!trimmedName) {
          return
        }

        // 重複チェック（大文字小文字区別なし）
        if (selectedIngredients.some((item) => item.toLowerCase() === trimmedName.toLowerCase())) {
          return
        }

        // 最大50個まで
        if (selectedIngredients.length >= 50) {
          console.warn('食材は最大50個まで選択できます')
          return
        }

        set({ selectedIngredients: [...selectedIngredients, trimmedName] })
      },

      // --------------------
      // アクション: 食材を削除
      // --------------------
      removeIngredient: (ingredientName: string) => {
        const { selectedIngredients } = get()
        set({
          selectedIngredients: selectedIngredients.filter(
            (item) => item.toLowerCase() !== ingredientName.toLowerCase(),
          ),
        })
      },

      // --------------------
      // アクション: 全ての食材をクリア
      // --------------------
      clearIngredients: () => {
        set({ selectedIngredients: [] })
      },

      // --------------------
      // ユーティリティ: 食材が選択されているか確認
      // --------------------
      isSelected: (ingredientName: string): boolean => {
        const { selectedIngredients } = get()
        return selectedIngredients.some(
          (item) => item.toLowerCase() === ingredientName.toLowerCase(),
        )
      },
    }),
    {
      name: 'ingredient-storage', // LocalStorageのキー名
      partialize: (state) => ({
        // 永続化する項目を指定
        selectedIngredients: state.selectedIngredients,
      }),
    },
  ),
)
