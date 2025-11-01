import { Request } from 'express'

export interface RequestWithUser extends Request {
  user: {
    id: string
    email: string
    displayName: string | null
    avatarUrl: string | null
  }
}
