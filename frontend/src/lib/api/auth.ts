import { apiClient } from './client'
import type {
  SignUpRequest,
  SignUpResponse,
  SignInRequest,
  SignInResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/types/auth'

/**
 * サインアップ
 *
 */
export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  const response = await apiClient.post<SignUpResponse>('/auth/signup', data)
  return response.data
}

/**
 * サインイン
 *
 */
export const signIn = async (data: SignInRequest): Promise<SignInResponse> => {
  const response = await apiClient.post<SignInResponse>('/auth/signin', data)
  return response.data
}

/**
 * トークンリフレッシュ
 *
 * ※apiClientのインターセプターが自動的に呼び出す
 */
export const refreshToken = async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', data)
  return response.data
}

/**
 * サインアウト
 *
 */
export const signOut = (): void => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  window.location.href = '/auth/signin'
}
