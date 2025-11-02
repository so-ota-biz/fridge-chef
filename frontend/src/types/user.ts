/**
 * ユーザー情報
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
