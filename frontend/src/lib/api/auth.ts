import { apiClient } from './client'
import axios from 'axios'
import type { SignUpRequest, SignUpResponse, SignInRequest, SignInResponse } from '@/types/auth'

type ApiErrorPayload = { message?: string | string[]; error?: string } | undefined

const extractApiErrorMessage = (err: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorPayload
    if (typeof data?.message === 'string' && data.message) return data.message
    if (Array.isArray(data?.message) && data.message.length > 0) return data.message[0]
    if (typeof data?.error === 'string' && data.error) return data.error
    return err.message || fallbackMessage
  }

  return err instanceof Error ? err.message : fallbackMessage
}

/**
 * サインアップ
 *
 */
export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  try {
    const response = await apiClient.post<SignUpResponse>('/auth/signup', data)
    return response.data
  } catch (err: unknown) {
    throw new Error(extractApiErrorMessage(err, '登録に失敗しました。もう一度お試しください。'))
  }
}

/**
 * サインイン
 *
 */
export const signIn = async (data: SignInRequest): Promise<SignInResponse> => {
  try {
    const response = await apiClient.post<SignInResponse>('/auth/signin', data)

    // トークンをローカルストレージに保存
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken)
    }

    return response.data
  } catch (err: unknown) {
    throw new Error(
      extractApiErrorMessage(
        err,
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
      ),
    )
  }
}

/** 現在のユーザー情報（トークンで検証） */
export const getMe = async () => {
  try {
    const response = await apiClient.get('/auth/me')
    return response.data
  } catch (err: unknown) {
    throw err
  }
}

/** ログアウト（ローカルストレージクリア） */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout')
  } catch (err: unknown) {
    // サーバーサイドのログアウトが失敗してもローカルストレージはクリア
    console.warn('Server logout failed:', err)
  } finally {
    // ローカルストレージからトークンを削除
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}
