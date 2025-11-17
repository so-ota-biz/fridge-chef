'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types/user'
import * as authApi from '@/lib/api/auth'

// CSRFクッキー設定完了を確実に待機するユーティリティ
const waitForCookie = async (cookieName: string, maxAttempts = 20): Promise<boolean> => {
  for (let i = 0; i < maxAttempts; i++) {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith(`${cookieName}=`))
    if (cookie) return true
    await new Promise(resolve => setTimeout(resolve, 50)) // 50ms間隔でチェック
  }
  return false
}

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
            // 認証状態を確認（インターセプターを避けるため axios 直接使用）
            // /auth/me はGETなのでCSRFトークン不要
            const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
            const response = await fetch(`${baseURL}/auth/me`, {
              credentials: 'include', // Cookie送信
            })

            if (!response.ok) {
              throw new Error('Not authenticated')
            }

            const me = await response.json()
            const nextUser: AuthUser = {
              id: me.id,
              email: me.email,
              displayName: me.displayName,
              avatarUrl: me.avatarUrl,
            }

            // 認証成功時：CSRFトークン取得→状態更新の順序で実行
            await authApi.initializeCsrf()
            // CSRFクッキー設定完了を確実に待機
            await waitForCookie('csrfToken')
            set({ user: nextUser, isAuthenticated: true, isAuthRestored: true })
          } catch (error) {
            // 認証失敗時はCSRFトークンだけ取得（未認証でも変更系リクエストに備えて）
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
