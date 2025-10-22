export interface UserProfile {
  id: string
  email: string | null
  displayName: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  isPremium: boolean | null
  premiumExpiresAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface UpdateProfileResponse {
  id: string
  displayName: string | null
  firstName: string | null
  lastName: string | null
  updatedAt: Date
}
