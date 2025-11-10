'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types/user'
import * as authApi from '@/lib/api/auth'

// ========================================
// 状態とアクションの型定義
// ========================================
interface AuthState {
  // 状態
  user: AuthUser | null
  isAuthenticated: boolean
  isAuthRestored: boolean

  // アクション
  setAuth: (user: AuthUser) => void
  setUser: (user: AuthUser) => void
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
      isAuthenticated: false,
      isAuthRestored: false,

      // --------------------
      // アクション: ログイン時に全ての認証情報をセット
      // --------------------
      setAuth: (user) => {
        set({ user, isAuthenticated: true, isAuthRestored: true })
      },

      // --------------------
      // アクション: ユーザー情報のみ更新
      // --------------------
      // 【使用例】プロフィール編集後、ユーザー情報だけ更新したい時
      setUser: (user) => {
        set({ user })
      },

      // --------------------
      // アクション: ログアウト時に全ての認証情報をクリア
      // --------------------
      clearAuth: () => {
        // Zustandストアをクリア
        set({
          user: null,
          isAuthenticated: false,
          isAuthRestored: true, // クリア処理も「復元完了」とみなす
        })
      },

      // --------------------
      // アクション: サーバーセッションから認証状態を復元
      // --------------------
      restoreAuth: () => {
        ;(async () => {
          try {
            // まずCSRFトークンを初期化
            await authApi.initializeCsrf()
            
            // 認証状態を確認
            const me = await authApi.getMe()
            const nextUser: AuthUser = {
              id: me.id,
              email: me.email,
              displayName: me.displayName,
              avatarUrl: me.avatarUrl,
            }
            set({ user: nextUser, isAuthenticated: true, isAuthRestored: true })
          } catch {
            // 認証失敗時もCSRFトークンは確保
            await authApi.initializeCsrf()
            set({ isAuthRestored: true, isAuthenticated: false, user: null })
          }
        })()
      },
    }),
    {
      name: 'auth-storage', // localStorageのキー名
      partialize: (state) => ({
        // 永続化する項目を指定
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
