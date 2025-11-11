import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  Res,
  UnauthorizedException,
  Logger,
} from '@nestjs/common'
import { AuthService } from '@/auth/auth.service'
import { SignUpDto } from '@/auth/dto/sign-up.dto'
import { SignInDto } from '@/auth/dto/sign-in.dto'
import { SignUpResponseDto } from '@/auth/dto/sign-up-response.dto'
import { AuthResponseDto } from '@/auth/dto/auth-response.dto'
import { ConfigService } from '@nestjs/config'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import type { RequestWithUser } from '@/auth/types/request-with-user.type'
import type { Response, CookieOptions } from 'express'
import { randomBytes } from 'crypto'
import { CsrfProtection } from '@/common/decorators/csrf-protection.decorator'

type RequestWithCookies = Request & { cookies?: Record<string, string | undefined> }

@Controller('auth')
export class AuthController {
  private readonly ACCESS_TOKEN_MAX_AGE: number
  private readonly REFRESH_TOKEN_MAX_AGE: number
  private readonly CSRF_TOKEN_MAX_AGE: number

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    // 環境変数から期限を取得（開発環境では短く設定可能）
    this.ACCESS_TOKEN_MAX_AGE = this.getTokenMaxAge(
      'ACCESS_TOKEN_MAX_AGE_MS',
      15 * 60 * 1000, // デフォルト: 15分
    )
    this.REFRESH_TOKEN_MAX_AGE = this.getTokenMaxAge(
      'REFRESH_TOKEN_MAX_AGE_MS',
      7 * 24 * 60 * 60 * 1000, // デフォルト: 7日
    )
    this.CSRF_TOKEN_MAX_AGE = this.getTokenMaxAge(
      'CSRF_TOKEN_MAX_AGE_MS',
      24 * 60 * 60 * 1000, // デフォルト: 24時間
    )
  }

  private readonly logger = new Logger(AuthController.name)

  private getTokenMaxAge(envKey: string, defaultValue: number): number {
    const envValue = this.configService.get<string>(envKey)
    if (envValue) {
      const parsed = parseInt(envValue, 10)
      if (!isNaN(parsed) && parsed > 0) {
        return parsed
      }
    }
    return defaultValue
  }

  private generateCsrfToken(): string {
    return randomBytes(32).toString('hex')
  }

  private buildCookieOptions(maxAgeMs: number, httpOnly: boolean): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production'
    let secure = this.configService.get<string>('COOKIE_SECURE') === 'true' || isProduction
    const sameSiteEnv = this.configService.get<string>('COOKIE_SAMESITE')?.toLowerCase()
    let sameSite: CookieOptions['sameSite']
    switch (sameSiteEnv) {
      case 'strict':
        sameSite = 'strict'
        break
      case 'none':
        sameSite = 'none'
        break
      case 'lax':
      case undefined:
      case '':
        sameSite = 'lax'
        break
      default:
        this.logger.warn(
          `COOKIE_SAMESITE=${sameSiteEnv} はサポートされていません。lax を適用します。`,
        )
        sameSite = 'lax'
        break
    }
    if (sameSite === 'none' && !secure) {
      this.logger.warn(
        'COOKIE_SAMESITE=none には Secure=true が必須のため、secure を強制的に有効化します。',
      )
      secure = true
    }
    const domain = this.configService.get<string>('COOKIE_DOMAIN') || undefined
    return {
      httpOnly,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge: maxAgeMs,
    }
  }

  private cookieOptions(maxAgeMs: number): CookieOptions {
    return this.buildCookieOptions(maxAgeMs, true)
  }

  private csrfCookieOptions(maxAgeMs: number): CookieOptions {
    return this.buildCookieOptions(maxAgeMs, false) // JSで読み取れる必要がある
  }

  /**
   * サインアップ
   * POST /auth/signup
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    return this.authService.signUp(signUpDto)
  }

  /**
   * サインイン
   * POST /auth/signin
   */
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: AuthResponseDto['user'] }> {
    const result = await this.authService.signIn(signInDto)

    // アクセス（15分）とリフレッシュ（7日）のCookieを設定
    res.cookie('accessToken', result.accessToken, this.cookieOptions(this.ACCESS_TOKEN_MAX_AGE))
    res.cookie('refreshToken', result.refreshToken, this.cookieOptions(this.REFRESH_TOKEN_MAX_AGE))
    // CSRFトークンをセット（24時間）
    const csrfToken = this.generateCsrfToken()
    res.cookie('csrfToken', csrfToken, this.csrfCookieOptions(this.CSRF_TOKEN_MAX_AGE))

    return { user: result.user }
  }

  /**
   * トークンリフレッシュ
   * POST /auth/refresh
   */
  @Post('refresh')
  @CsrfProtection()
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Request() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const refresh = req.cookies?.refreshToken
    if (!refresh) {
      throw new UnauthorizedException('Refresh token is missing')
    }
    const tokens = await this.authService.refreshToken(refresh)

    res.cookie('accessToken', tokens.accessToken, this.cookieOptions(this.ACCESS_TOKEN_MAX_AGE))
    res.cookie('refreshToken', tokens.refreshToken, this.cookieOptions(this.REFRESH_TOKEN_MAX_AGE))
    // CSRFトークンもローテーション
    const csrfToken = this.generateCsrfToken()
    res.cookie('csrfToken', csrfToken, this.csrfCookieOptions(this.CSRF_TOKEN_MAX_AGE))
    return { ok: true }
  }

  /**
   * ログアウト
   * POST /auth/logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response): void {
    const clearOpts = this.cookieOptions(0)
    res.clearCookie('accessToken', clearOpts)
    res.clearCookie('refreshToken', clearOpts)
    res.clearCookie('csrfToken', this.csrfCookieOptions(0))
  }

  /**
   * CSRFトークン発行（必要時）
   */
  @Get('csrf')
  @HttpCode(HttpStatus.OK)
  issueCsrf(@Res({ passthrough: true }) res: Response): { ok: true } {
    const csrfToken = this.generateCsrfToken()
    res.cookie('csrfToken', csrfToken, this.csrfCookieOptions(this.CSRF_TOKEN_MAX_AGE))
    return { ok: true }
  }

  /**
   * 現在のユーザー情報取得（動作確認用）
   * GET /auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: RequestWithUser) {
    return req.user
  }
}
