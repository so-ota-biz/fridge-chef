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

type RequestWithCookies = Request & { cookies?: Record<string, string | undefined> }

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(AuthController.name)

  private cookieOptions(maxAgeMs: number): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production'
    let secure = this.configService.get<string>('COOKIE_SECURE') === 'true' || isProduction
    const sameSiteEnv = this.configService.get<string>('COOKIE_SAMESITE')
    const sameSite: CookieOptions['sameSite'] = sameSiteEnv === 'none' ? 'none' : 'lax'
    if (sameSite === 'none' && !secure) {
      this.logger.warn('COOKIE_SAMESITE=none には Secure=true が必須のため、secure を強制的に有効化します。')
      secure = true
    }
    const domain = this.configService.get<string>('COOKIE_DOMAIN') || undefined
    return {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge: maxAgeMs,
    }
  }

  private csrfCookieOptions(maxAgeMs: number): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production'
    let secure = this.configService.get<string>('COOKIE_SECURE') === 'true' || isProduction
    const sameSiteEnv = this.configService.get<string>('COOKIE_SAMESITE')
    const sameSite: CookieOptions['sameSite'] = sameSiteEnv === 'none' ? 'none' : 'lax'
    if (sameSite === 'none' && !secure) {
      this.logger.warn('COOKIE_SAMESITE=none には Secure=true が必須のため、secure を強制的に有効化します。')
      secure = true
    }
    const domain = this.configService.get<string>('COOKIE_DOMAIN') || undefined
    return {
      httpOnly: false, // JSで読み取れる必要がある
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge: maxAgeMs,
    }
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
    const accessMax = 15 * 60 * 1000
    const refreshMax = 7 * 24 * 60 * 60 * 1000
    res.cookie('accessToken', result.accessToken, this.cookieOptions(accessMax))
    res.cookie('refreshToken', result.refreshToken, this.cookieOptions(refreshMax))
    // CSRFトークンをセット（24時間）
    const csrfToken = randomBytes(32).toString('hex')
    res.cookie('csrfToken', csrfToken, this.csrfCookieOptions(24 * 60 * 60 * 1000))

    return { user: result.user }
  }

  /**
   * トークンリフレッシュ
   * POST /auth/refresh
   */
  @Post('refresh')
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

    const accessMax = 15 * 60 * 1000
    const refreshMax = 7 * 24 * 60 * 60 * 1000
    res.cookie('accessToken', tokens.accessToken, this.cookieOptions(accessMax))
    res.cookie('refreshToken', tokens.refreshToken, this.cookieOptions(refreshMax))
    // CSRFトークンもローテーション
    const csrfToken = randomBytes(32).toString('hex')
    res.cookie('csrfToken', csrfToken, this.csrfCookieOptions(24 * 60 * 60 * 1000))
    return { ok: true }
  }

  /**
   * ログアウト
   * POST /auth/logout
   */
  @Post('logout')
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
    const csrfToken = randomBytes(32).toString('hex')
    res.cookie('csrfToken', csrfToken, this.csrfCookieOptions(24 * 60 * 60 * 1000))
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
