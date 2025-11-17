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

/** 現在のユーザー情報（Cookieで検証） */
export const getMe = async () => {
  try {
    const response = await apiClient.get('/auth/me')
    return response.data
  } catch (err: unknown) {
    throw err
  }
}

/** ログアウト（Cookie削除） */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout')
  } catch (err: unknown) {
    throw err
  }
}

/** CSRFトークン初期化（初回アクセス時やトークンが存在しない場合） */
export const initializeCsrf = async (): Promise<void> => {
  try {
    console.log('[CSRF-DEBUG] Requesting CSRF token from /auth/csrf')
    const response = await apiClient.get<{ ok: boolean; csrfToken: string }>('/auth/csrf')
    console.log('[CSRF-DEBUG] CSRF response received:', response.status, 'Cookies after:', document.cookie.split(';').length)
    
    // CSRFクッキーが設定されていない場合のバックアップ
    const hasCsrfCookie = document.cookie.split(';').some(cookie => 
      cookie.trim().startsWith('csrfToken=')
    )
    if (response.data.csrfToken && !hasCsrfCookie) {
      console.log('[CSRF-DEBUG] Setting CSRF token manually as fallback')
      const domain = window.location.hostname.includes('vercel.app') ? '.vercel.app' : undefined
      const domainPart = domain ? `; domain=${domain}` : ''
      document.cookie = `csrfToken=${response.data.csrfToken}; path=/; secure; samesite=none${domainPart}`
    }
  } catch (err: unknown) {
    // CSRF初期化の失敗はログに記録するが、アプリの動作は継続
    console.warn('[CSRF-DEBUG] CSRF token initialization failed:', err)
    if (err instanceof Error) {
      console.warn('[CSRF-DEBUG] Error details:', err.message)
    }
  }
}
