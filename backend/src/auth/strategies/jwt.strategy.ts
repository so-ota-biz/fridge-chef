import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
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
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || '',
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
