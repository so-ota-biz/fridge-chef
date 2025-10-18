export class SignUpResponseDto {
  user: {
    id: string
    email: string
    displayName: string | null
    avatarUrl: string | null
    isPremium: boolean
  }
  message: string
}
