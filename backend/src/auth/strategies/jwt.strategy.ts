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
  isPremium: boolean
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
    const userProfile = await this.prisma.userProfileView.findUnique({
      where: { id: payload.sub },
    })

    if (!userProfile) {
      throw new UnauthorizedException('ユーザーが見つかりません')
    }

    return {
      id: userProfile.id,
      email: userProfile.email,
      displayName: userProfile.displayName,
      avatarUrl: userProfile.avatarUrl,
      isPremium: userProfile.isPremium,
    }
  }
}
