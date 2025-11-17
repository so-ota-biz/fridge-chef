import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
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
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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
  async signIn(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    const result = await this.authService.signIn(signInDto)
    return result
  }

  /**
   * トークンリフレッシュ
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() body: { refreshToken: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = body
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing')
    }
    const tokens = await this.authService.refreshToken(refreshToken)
    return tokens
  }

  /**
   * ログアウト
   * POST /auth/logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(): void {
    // ローカルストレージベースのため、サーバー側では特別な処理不要
    // クライアント側でLocalStorageからトークンを削除
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
