'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import * as authApi from '@/lib/api/auth'
import type { SignUpRequest, SignInRequest } from '@/types/auth'

// ========================================
// サインアップフック
// ========================================
/**
 * 【役割】新規ユーザー登録を行う
 */
export const useSignUp = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: SignUpRequest) => authApi.signUp(data),
    onSuccess: () => {
      // サインアップ成功後、サインインページにリダイレクト
      // クエリパラメータで成功メッセージを渡す
      router.push('/auth/signin?signup=success')
    },
  })
}

// ========================================
// サインインフック
// ========================================
/**
 * 【役割】ユーザーをログインさせる
 */
export const useSignIn = () => {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SignInRequest) => authApi.signIn(data),
    onSuccess: (response) => {
      // 認証情報をストアに保存
      setAuth(response.user)

      // React Queryのキャッシュをクリア（別ユーザーのデータが残っている可能性があるため）
      queryClient.clear()

      // TOPページにリダイレクト
      router.push('/')
    },
  })
}

// ========================================
// サインアウトフック
// ========================================
/**
 * 【役割】ユーザーをログアウトさせる
 */
export const useSignOut = () => {
  const router = useRouter()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const queryClient = useQueryClient()

  return () => {
    // サーバーログアウト→クライアント状態クリア
    authApi
      .logout()
      .catch(() => void 0)
      .finally(() => {
        clearAuth()
        queryClient.clear()
        router.push('/auth/signin')
      })
  }
}

// ========================================
// 認証状態取得フック
// ========================================
/**
 * 【役割】現在の認証状態を取得する
 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return {
    user,
    isAuthenticated,
  }
}
