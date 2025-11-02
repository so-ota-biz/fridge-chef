/**
 * サインアップリクエスト
 */
export interface SignUpRequest {
  email: string
  password: string
  displayName: string
}

/**
 * サインアップレスポンス
 */
export interface SignUpResponse {
  user: {
    id: string
    email: string
    displayName: string
    avatarUrl: string | null
  }
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
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    displayName: string
    avatarUrl: string | null
  }
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
}

/**
 * GET /auth/me レスポンス
 */
export interface AuthMeResponse {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
}
