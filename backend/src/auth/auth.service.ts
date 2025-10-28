import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient, AuthError } from '@supabase/supabase-js'
import { PrismaService } from '@/prisma/prisma.service'
import { SignUpDto } from '@/auth/dto/sign-up.dto'
import { SignInDto } from '@/auth/dto/sign-in.dto'
import { SignUpResponseDto } from '@/auth/dto/sign-up-response.dto'
import { AuthResponseDto } from '@/auth/dto/auth-response.dto'
import { Database } from '@/types/database.types'
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private _supabaseAdmin: SupabaseClient<Database> | null = null

  private get supabaseAdmin(): SupabaseClient<Database> {
    if (!this._supabaseAdmin) {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        this.logger.error('Supabase configuration is missing at AuthService')
        throw new InternalServerErrorException('Supabase configuration is missing at AuthService')
      }

      this.logger.log('Initializing Supabase client...at AuthService')
      this._supabaseAdmin = createClient<Database>(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      )
      this.logger.log('Supabase client initialized at AuthService')
    }
    return this._supabaseAdmin
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * サインアップ処理
   */
  async signUp(signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    const { email, password, displayName, firstName, lastName } = signUpDto

    try {
      // 環境変数からフロントエンドURLを取得
      const frontendUrl = this.configService.get<string>('FRONTEND_URL')

      // 通常のサインアップ（メール確認付き）
      const { data: authData, error: authError } = await this.supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          //TODO
          //emailRedirectTo: `${frontendUrl}/auth/callback`, // ← 環境変数を使用
        },
      })

      if (authError) {
        this.handleAuthError(authError, 'このメールアドレスは既に登録されています')
      }

      if (!authData.user) {
        throw new InternalServerErrorException('ユーザーの作成に失敗しました')
      }

      // トリガーでusersが自動作成されているはずなので、追加情報があれば更新
      if (displayName || firstName || lastName) {
        await this.prisma.user.update({
          where: { id: authData.user.id },
          data: {
            displayName: displayName || null,
            firstName: firstName || null,
            lastName: lastName || null,
          },
        })
      }

      // public.usersから最新情報を取得
      const user = await this.prisma.user.findUnique({
        where: { id: authData.user.id },
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      })

      if (!user) {
        throw new InternalServerErrorException('ユーザープロファイルの取得に失敗しました')
      }

      return {
        user: {
          id: user.id,
          email: authData.user.email!,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
        message:
          '確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。',
      }
    } catch (error) {
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error
      }
      throw new InternalServerErrorException('サインアップ処理に失敗しました')
    }
  }

  /**
   * サインイン処理
   */
  async signIn(signInDto: SignInDto): Promise<AuthResponseDto> {
    const { email, password } = signInDto

    try {
      // Supabase GoTrueで認証
      const { data: authData, error: authError } = await this.supabaseAdmin.auth.signInWithPassword(
        {
          email,
          password,
        },
      )

      if (authError) {
        this.handleAuthError(authError, 'メールアドレスまたはパスワードが正しくありません')
      }

      if (!authData.user) {
        throw new UnauthorizedException('認証に失敗しました')
      }

      // メール確認チェック
      if (!authData.user.email_confirmed_at) {
        throw new UnauthorizedException(
          'メールアドレスが確認されていません。受信トレイを確認し、確認リンクをクリックしてください。',
        )
      }

      // public.usersからユーザー情報を取得
      const user = await this.prisma.user.findUnique({
        where: { id: authData.user.id },
      })

      if (!user) {
        throw new InternalServerErrorException('ユーザー情報の取得に失敗しました')
      }

      // 独自JWTトークンを発行
      const tokens = await this.generateTokens(authData.user.id, email)

      return {
        ...tokens,
        user: {
          id: user.id,
          email: authData.user.email!,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
      }
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof InternalServerErrorException) {
        throw error
      }
      throw new UnauthorizedException('認証に失敗しました')
    }
  }

  /**
   * トークンリフレッシュ
   */
  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    // auth.usersからemailを取得
    const { data: authData, error } = await this.supabaseAdmin.auth.admin.getUserById(userId)

    if (error || !authData?.user?.email) {
      throw new UnauthorizedException('Failed to fetch user email')
    }

    const payload = { sub: userId, email: authData.user.email }
    const accessToken = await this.jwtService.signAsync(payload)

    return { accessToken }
  }

  /**
   * アクセストークンとリフレッシュトークンを生成
   */
  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    ])

    return { accessToken, refreshToken }
  }

  /**
   * Supabase AuthErrorをハンドリング
   */
  private handleAuthError(error: AuthError, duplicateMessage: string): never {
    const errorMessage = error.message || '不明なエラー'

    if (
      errorMessage.includes('already registered') ||
      errorMessage.includes('already exists') ||
      errorMessage.includes('User already registered')
    ) {
      throw new ConflictException(duplicateMessage)
    }

    if (errorMessage.includes('Invalid login credentials')) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません')
    }

    // メール未確認エラーを追加
    if (errorMessage.includes('Email not confirmed')) {
      throw new UnauthorizedException(
        'メールアドレスが確認されていません。受信トレイを確認し、確認リンクをクリックしてください。',
      )
    }

    throw new InternalServerErrorException(`認証エラー: ${errorMessage}`)
  }
}
