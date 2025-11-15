import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ConfigService } from '@nestjs/config'
import { Database } from '@/types/database.types'
import { UpdateUserDto } from '@/users/dto/update-user.dto'
import { User, UpdateUserResponse } from '@/users/types/user.type'
import { UploadAvatarResponse } from '@/users/types/upload-avatar.type'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Prisma } from '@prisma/client'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)
  private _supabaseAdmin: SupabaseClient<Database> | null = null

  private get supabaseAdmin(): SupabaseClient<Database> {
    if (!this._supabaseAdmin) {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL')
      const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        this.logger.error('Supabase configuration is missing at UsersService')
        throw new InternalServerErrorException('Supabase configuration is missing at UsersService')
      }

      this.logger.log('Initializing Supabase client...at UsersService')
      this._supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey)
      this.logger.log('Supabase client initialized at UsersService')
    }
    return this._supabaseAdmin
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // auth.usersからemailを取得
    const { data: authData, error } = await this.supabaseAdmin.auth.admin.getUserById(userId)

    if (error || !authData?.user?.email) {
      throw new UnauthorizedException('Failed to fetch user email')
    }

    return {
      ...user,
      email: authData.user.email,
    }
  }

  /**
   * ユーザー情報更新
   */
  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<UpdateUserResponse> {
    const updateData = Object.fromEntries(
      Object.entries({
        displayName: updateUserDto.displayName,
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
      }).filter(([_, value]) => value !== undefined),
    ) as Partial<UpdateUserDto>

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        displayName: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return updatedUser
  }

  /**
   * アバター画像をアップロードして、ユーザー情報を更新
   */
  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<UploadAvatarResponse> {
    // ファイル形式チェック
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
    }

    // ファイルサイズチェック（5MB）
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit.')
    }

    // 新しいファイル名を生成（UUID + 拡張子）
    const fileExtension = path.extname(file.originalname)
    const fileName = `${uuidv4()}${fileExtension}`
    const filePath = `${userId}/${fileName}`

    // 既存のアバターを取得
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    })
    // 古いアバターを削除（存在する場合）
    if (existingUser?.avatarUrl) {
      await this.deleteOldAvatar(existingUser.avatarUrl)
    }

    // Supabase Storageにアップロード
    const { error: uploadError } = await this.supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new BadRequestException(`Failed to upload avatar: ${uploadError.message}`)
    }

    // 公開URLを取得
    const avatarUrl = this.getPublicUrl('avatars', filePath)

    // ユーザー情報を更新
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        avatarUrl: true,
        updatedAt: true,
      },
    })

    return {
      avatarUrl: updatedUser.avatarUrl!,
      updatedAt: updatedUser.updatedAt,
    }
  }

  /**
   * Supabase Storageの公開URLを取得（Docker環境対応）
   */
  private getPublicUrl(bucketName: string, filePath: string): string {
    const { data: urlData } = this.supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath)

    // Docker環境の内部URLを公開URLに置換
    const publicUrl = this.configService.get<string>('SUPABASE_PUBLIC_URL')
    const convertedUrl = urlData.publicUrl.replace(
      'http://supabase_kong_backend:8000',
      publicUrl || 'http://127.0.0.1:54321',
    )

    return convertedUrl
  }

  /**
   * 古いアバター画像をStorageから削除
   */
  private async deleteOldAvatar(avatarUrl: string): Promise<void> {
    try {
      // URLからファイルパスを抽出
      // 例: http://127.0.0.1:54321/storage/v1/object/public/avatars/user-id/filename.jpg
      //  → user-id/filename.jpg
      const urlParts = avatarUrl.split('/avatars/')
      if (urlParts.length < 2) {
        return
      }
      const filePath = urlParts[1]

      await this.supabaseAdmin.storage.from('avatars').remove([filePath])
    } catch (error) {
      // 削除失敗はログ出力のみ（処理は継続）
      this.logger.error('Failed to delete old avatar:', error)
    }
  }

  /**
   * パスワード変更
   * @param userId ユーザーID
   * @param currentPassword 現在のパスワード
   * @param newPassword 新しいパスワード
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // STEP1. 現在のパスワードを確認
    const { data: authData } = await this.supabaseAdmin.auth.admin.getUserById(userId)

    if (!authData?.user) {
      throw new NotFoundException('ユーザーが見つかりません')
    }

    if (!authData?.user?.email) {
      throw new NotFoundException(
        'メールアドレスが登録されていないため、パスワードを変更できません',
      )
    }

    // STEP2. 現在のパスワードと新しいパスワードが同じかチェック
    if (currentPassword === newPassword) {
      throw new BadRequestException('新しいパスワードは現在のパスワードと異なる必要があります')
    }

    // STEP3. 現在のパスワードで認証を試みる
    const { error: signInError } = await this.supabaseAdmin.auth.signInWithPassword({
      email: authData.user.email,
      password: currentPassword,
    })

    if (signInError) {
      throw new UnauthorizedException('現在のパスワードが正しくありません')
    }

    // STEP4. 新しいパスワードに更新
    const { error: updateError } = await this.supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (updateError) {
      this.logger.error('Password update error:', updateError)
      throw new InternalServerErrorException('パスワードの変更に失敗しました')
    }
  }

  /**
   * アカウント削除
   * @param userId ユーザーID
   * @param password パスワード（確認用）
   */
  async deleteAccount(userId: string, password: string): Promise<void> {
    // 1. ユーザー情報を取得（auth.users から）
    const { data: authData, error: getUserError } =
      await this.supabaseAdmin.auth.admin.getUserById(userId)

    if (getUserError || !authData?.user) {
      throw new NotFoundException('ユーザーが見つかりません')
    }

    if (!authData.user.email) {
      throw new BadRequestException(
        'メールアドレスが登録されていないため、アカウントを削除できません',
      )
    }

    // 2. パスワード確認
    const { error: signInError } = await this.supabaseAdmin.auth.signInWithPassword({
      email: authData.user.email,
      password: password,
    })

    if (signInError) {
      throw new UnauthorizedException('パスワードが正しくありません')
    }

    // 3. 削除処理
    try {
      // 3-1. public.users からユーザー情報を取得（avatar_url確認用）
      const dbUser = await this.prisma.user.findUnique({
        where: { id: userId },
      })

      if (!dbUser) {
        throw new NotFoundException('ユーザーデータが見つかりません（public.users）')
      }

      // 3-2. アバター画像が存在する場合は削除
      if (dbUser.avatarUrl) {
        // avatarUrl から画像パスを抽出
        // 例: http://127.0.0.1:54321/storage/v1/object/public/avatars/userId/filename.jpg
        // -> userId/filename.jpg を取得
        const urlParts = dbUser.avatarUrl.split('/avatars/')
        if (urlParts.length > 1) {
          const imagePath = urlParts[1]

          const { error: deleteStorageError } = await this.supabaseAdmin.storage
            .from('avatars')
            .remove([imagePath])

          if (deleteStorageError) {
            this.logger.error('Avatar deletion error:', deleteStorageError)
            // ストレージ削除失敗はログ出力のみで処理は継続する
          } else {
            this.logger.log(`Avatar deleted: ${imagePath}`)
          }
        }
      }

      // 3-3. auth.users からユーザー削除（public.usersは on_auth_user_deleted トリガーで自動削除）
      const { error: deleteAuthError } = await this.supabaseAdmin.auth.admin.deleteUser(userId)

      if (deleteAuthError) {
        this.logger.error('Auth user deletion error:', deleteAuthError)
        throw new InternalServerErrorException('アカウントの削除に失敗しました')
      }
      this.logger.log(
        `User deleted from auth.users: ${userId} (public.users also deleted by trigger)`,
      )

      // 4. 成功ログ
      this.logger.log(`Account deleted successfully for user: ${userId}`)
    } catch (error) {
      // エラーが既にNestJSの例外の場合はそのまま再スロー
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof InternalServerErrorException ||
        error instanceof BadRequestException
      ) {
        throw error
      }
      // Prismaエラー
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found
          throw new NotFoundException('ユーザーが見つかりません')
        }
      }
      // その他のエラー
      this.logger.error('Unexpected error during account deletion:', error)
      throw new InternalServerErrorException('アカウント削除中に予期しないエラーが発生しました')
    }
  }
}
