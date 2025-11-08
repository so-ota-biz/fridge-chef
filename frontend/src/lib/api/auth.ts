import { apiClient } from './client'
import axios from 'axios'
import type { SignUpRequest, SignUpResponse, SignInRequest, SignInResponse } from '@/types/auth'

/**
 * サインアップ
 *
 */
export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  try {
    const response = await apiClient.post<SignUpResponse>('/auth/signup', data)
    return response.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as { message?: string | string[]; error?: string } | undefined
      const msg =
        (typeof data?.message === 'string' && data?.message) ||
        (Array.isArray(data?.message) && data?.message?.[0]) ||
        data?.error ||
        err.message ||
        '登録に失敗しました。もう一度お試しください。'
      throw new Error(msg)
    }
    throw new Error(err instanceof Error ? err.message : '登録に失敗しました。もう一度お試しください。')
  }
}

/**
 * サインイン
 *
 */
export const signIn = async (data: SignInRequest): Promise<SignInResponse> => {
  try {
    const response = await apiClient.post<SignInResponse>('/auth/signin', data)
    return response.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as { message?: string | string[]; error?: string } | undefined
      const msg =
        (typeof data?.message === 'string' && data?.message) ||
        (Array.isArray(data?.message) && data?.message?.[0]) ||
        data?.error ||
        err.message ||
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
      throw new Error(msg)
    }
    throw new Error(
      err instanceof Error
        ? err.message
        : 'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
    )
  }
}
