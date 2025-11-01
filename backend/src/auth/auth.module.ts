import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService } from '@/auth/auth.service'
import { AuthController } from '@/auth/auth.controller'
import { JwtStrategy } from '@/auth/strategies/jwt.strategy'
import { PrismaModule } from '@/prisma/prisma.module'

@Module({
  imports: [
    PrismaModule, // データベース操作用
    PassportModule, // Passport認証の基盤
    ConfigModule, // 環境変数読み込み用
    // JWT設定（非同期）
    JwtModule.registerAsync({
      imports: [ConfigModule], // ConfigServiceを使うため
      inject: [ConfigService], // DIでConfigServiceを注入
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET') // .envから取得

        if (!secret) {
          throw new Error('JWT_SECRET is not defined in environment variables')
        }

        return {
          secret,
          signOptions: {
            expiresIn: '15m', // 固定値
          },
        }
      },
    }),
  ],
  controllers: [AuthController],
  // AuthService:認証ビジネスロジック, JwtStrategy:JWTトークンの検証ロジック
  providers: [AuthService, JwtStrategy],
  // AuthServiceを他モジュールで使えるようにエクスポート
  exports: [AuthService],
})
export class AuthModule {}
