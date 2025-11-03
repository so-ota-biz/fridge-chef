'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types/user'

// ========================================
// 状態とアクションの型定義
// ========================================
interface AuthState {
  // 状態
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  // アクション
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void
  setUser: (user: AuthUser) => void
  updateTokens: (accessToken: string, refreshToken?: string) => void
  clearAuth: () => void
  restoreAuth: () => void
}

// ========================================
// Zustandストアの作成
// ========================================
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // --------------------
      // 初期状態
      // --------------------
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // --------------------
      // アクション: ログイン時に全ての認証情報をセット
      // --------------------
      setAuth: (user, accessToken, refreshToken) => {
        // ローカルストレージにトークンを保存（APIクライアントで使用）
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        // Zustandストアを更新
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })
      },

      // --------------------
      // アクション: ユーザー情報のみ更新
      // --------------------
      // 【使用例】プロフィール編集後、ユーザー情報だけ更新したい時
      setUser: (user) => {
        set({ user })
      },

      // --------------------
      // アクション: トークンのみ更新（リフレッシュ時）
      // --------------------
      // 【使用例】APIクライアントがトークンをリフレッシュした時
      updateTokens: (accessToken, refreshToken) => {
        // ローカルストレージを更新
        localStorage.setItem('accessToken', accessToken)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }

        // Zustandストアを更新
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
        }))
      },

      // --------------------
      // アクション: ログアウト時に全ての認証情報をクリア
      // --------------------
      clearAuth: () => {
        // ローカルストレージからトークンを削除
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        // Zustandストアをクリア
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      // --------------------
      // アクション: ローカルストレージから認証状態を復元
      // --------------------
      restoreAuth: () => {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        const currentState = get()

        // トークンが存在し、ユーザー情報もある場合は認証状態を復元
        if (accessToken && refreshToken && currentState.user) {
          set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
          })
        }
      },
    }),
    {
      name: 'auth-storage', // localStorageのキー名
      partialize: (state) => ({
        // 永続化する項目を指定
        // トークンはlocalStorageに直接保存するため、ここでは除外
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
