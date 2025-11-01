export interface User {
  id: string
  email: string | null
  displayName: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UpdateUserResponse {
  id: string
  displayName: string | null
  firstName: string | null
  lastName: string | null
  createdAt: Date
  updatedAt: Date
}
