import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common'
import { AuthService } from '@/auth/auth.service'
import { SignUpDto } from '@/auth/dto/sign-up.dto'
import { SignInDto } from '@/auth/dto/sign-in.dto'
import { SignUpResponseDto } from '@/auth/dto/sign-up-response.dto'
import { AuthResponseDto } from '@/auth/dto/auth-response.dto'
import { RefreshTokenDto } from '@/auth/dto/refresh-token.dto'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'

// リクエストにユーザー情報が含まれる型定義
interface RequestWithUser extends Request {
  user: {
    id: string
    email: string
    displayName: string | null
    avatarUrl: string | null
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return this.authService.signIn(signInDto)
  }

  /**
   * トークンリフレッシュ
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken)
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
