import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import type { Request } from 'express'
import { PrismaService } from '@/prisma/prisma.service'

interface JwtPayload {
  sub: string
  email: string
  iat?: number
  exp?: number
}

interface ValidatedUser {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = config.get<string>('JWT_SECRET')
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured')
    }
    super({
      jwtFromRequest: (req: Request): string | null => {
        const cookiesUnknown = (req as Request & { cookies?: unknown }).cookies
        if (cookiesUnknown && typeof cookiesUnknown === 'object') {
          const token: unknown = (cookiesUnknown as Record<string, unknown>).accessToken
          return typeof token === 'string' && token.length > 0 ? token : null
        }
        return null
      },
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    })
  }

  async validate(payload: JwtPayload): Promise<ValidatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException('ユーザーが見つかりません')
    }

    // JWTペイロードからemailを取得（auth.usersの情報）
    return {
      id: user.id,
      email: payload.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    }
  }
}
