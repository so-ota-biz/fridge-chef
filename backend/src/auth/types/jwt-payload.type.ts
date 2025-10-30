export interface JwtPayload {
  sub: string // ユーザーID
  email: string
  iat?: number // issued at
  exp?: number // expiration time
}
