import { ConfigService } from '@nestjs/config'

/**
 * トークン期限設定のユーティリティ
 * AuthServiceとAuthControllerで共通使用
 */
export class TokenConfigUtil {
  static getTokenMaxAge(
    configService: ConfigService,
    envKey: string,
    defaultValue: number,
  ): number {
    const value = configService.get<string>(envKey)
    if (!value) return defaultValue

    const parsed = parseInt(value, 10)
    return isNaN(parsed) || parsed <= 0 ? defaultValue : parsed
  }

  static getAccessTokenMaxAge(configService: ConfigService): number {
    return this.getTokenMaxAge(configService, 'ACCESS_TOKEN_MAX_AGE_MS', 15 * 60 * 1000)
  }

  static getRefreshTokenMaxAge(configService: ConfigService): number {
    return this.getTokenMaxAge(configService, 'REFRESH_TOKEN_MAX_AGE_MS', 7 * 24 * 60 * 60 * 1000)
  }

  static getCsrfTokenMaxAge(configService: ConfigService): number {
    return this.getTokenMaxAge(configService, 'CSRF_TOKEN_MAX_AGE_MS', 24 * 60 * 60 * 1000)
  }
}
