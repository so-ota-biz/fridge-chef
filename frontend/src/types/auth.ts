import type { AuthUser } from './user'

/**
 * サインアップリクエスト
 */
export interface SignUpRequest {
  email: string
  password: string
  displayName?: string
}

/**
 * サインアップレスポンス
 */
export interface SignUpResponse {
  user: AuthUser
  message: string
}

/**
 * サインインリクエスト
 */
export interface SignInRequest {
  email: string
  password: string
}

/**
 * サインインレスポンス
 */
export interface SignInResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

/**
 * トークンリフレッシュリクエスト
 */
export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * トークンリフレッシュレスポンス
 */
export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

/**
 * GET /auth/me レスポンス
 */
export interface AuthMeResponse {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
}
