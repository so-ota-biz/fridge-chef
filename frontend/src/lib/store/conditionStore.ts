'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  RecipeGenre,
  RecipeDifficulty,
  CookingTime,
  type RecipeConditions,
} from '@/types/condition'

/**
 * 条件設定ストアの状態型
 */
interface ConditionStoreState {
  // 状態
  genre: RecipeGenre
  difficulty: RecipeDifficulty
  cookingTime: CookingTime
  servings: number

  // アクション
  setGenre: (genre: RecipeGenre) => void
  setDifficulty: (difficulty: RecipeDifficulty) => void
  setCookingTime: (cookingTime: CookingTime) => void
  setServings: (servings: number) => void
  setConditions: (
    conditions: Partial<
      Omit<
        ConditionStoreState,
        | 'setGenre'
        | 'setDifficulty'
        | 'setCookingTime'
        | 'setServings'
        | 'setConditions'
        | 'clearConditions'
        | 'getConditions'
      >
    >,
  ) => void
  clearConditions: () => void
  getConditions: () => Omit<RecipeConditions, 'ingredients'>
}

/**
 * 条件設定状態管理ストア
 *
 * レシピ生成条件を管理し、LocalStorage に永続化する
 */
export const useConditionStore = create<ConditionStoreState>()(
  persist(
    (set, get) => ({
      // --------------------
      // 初期状態
      // --------------------
      genre: RecipeGenre.JAPANESE, // デフォルト: 和食
      difficulty: RecipeDifficulty.EASY, // デフォルト: 簡単
      cookingTime: CookingTime.MEDIUM, // デフォルト: 30分程度
      servings: 2, // デフォルト: 2人分

      // --------------------
      // アクション: ジャンルを設定
      // --------------------
      setGenre: (genre: RecipeGenre) => {
        set({ genre })
      },

      // --------------------
      // アクション: 難易度を設定
      // --------------------
      setDifficulty: (difficulty: RecipeDifficulty) => {
        set({ difficulty })
      },

      // --------------------
      // アクション: 調理時間を設定
      // --------------------
      setCookingTime: (cookingTime: CookingTime) => {
        set({ cookingTime })
      },

      // --------------------
      // アクション: 人数を設定
      // --------------------
      setServings: (servings: number) => {
        // 1-10人の範囲に制限
        const validServings = Math.max(1, Math.min(10, Math.floor(servings)))
        set({ servings: validServings })
      },

      // --------------------
      // アクション: 複数の条件を一度に設定
      // --------------------
      setConditions: (conditions) => {
        const next: Partial<ConditionStoreState> = { ...conditions }
        if (typeof next.servings === 'number') {
          next.servings = Math.max(1, Math.min(10, Math.floor(next.servings)))
        }
        set(next)
      },

      // --------------------
      // アクション: 条件をデフォルトにリセット
      // --------------------
      clearConditions: () => {
        set({
          genre: RecipeGenre.JAPANESE,
          difficulty: RecipeDifficulty.EASY,
          cookingTime: CookingTime.MEDIUM,
          servings: 2,
        })
      },

      // --------------------
      // ユーティリティ: 現在の条件を取得（ingredientIds 以外）
      // --------------------
      getConditions: (): Omit<RecipeConditions, 'ingredients'> => {
        const { genre, difficulty, cookingTime, servings } = get()
        return {
          genre,
          difficulty,
          cookingTime,
          servings,
        }
      },
    }),
    {
      name: 'condition-storage',
      partialize: (state) => ({
        genre: state.genre,
        difficulty: state.difficulty,
        cookingTime: state.cookingTime,
        servings: state.servings,
      }),
    },
  ),
)
