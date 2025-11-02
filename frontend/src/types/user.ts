// ========================================
// 基本のユーザー型（public.users + auth.users.email）
// ========================================
/**
 * ユーザー情報（完全版）
 */
export interface User {
  id: string
  email: string
  displayName: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

// ========================================
// 認証エンドポイント用のユーザー型（派生型）
// ========================================
/**
 * 認証エンドポイントで返されるユーザー情報（基本情報のみ）
 */
export type AuthUser = Pick<User, 'id' | 'email' | 'displayName' | 'avatarUrl'>

/**
 * ユーザー情報更新リクエスト
 */
export interface UpdateUserRequest {
  displayName?: string
  firstName?: string
  lastName?: string
}

/**
 * パスワード変更リクエスト
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

/**
 * アカウント削除リクエスト
 */
export interface DeleteAccountRequest {
  password: string
}

/**
 * アバターアップロードレスポンス
 */
export interface UploadAvatarResponse {
  avatarUrl: string
}
