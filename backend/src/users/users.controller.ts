import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common'
import { UsersService } from '@/users/users.service'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import type { RequestWithUser } from '@/auth/types/request-with-user.type'
import { User, UpdateUserResponse } from '@/users/types/user.type'
import { UpdateUserDto } from '@/users/dto/update-user.dto'
import { UploadAvatarResponse } from '@/users/types/upload-avatar.type'
import { FileInterceptor } from '@nestjs/platform-express'
import { ChangePasswordDto } from '@/users/dto/change-password.dto'
import { DeleteAccountDto } from '@/users/dto/delete-account.dto'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * 自分のユーザー情報取得（認証必須）
   */
  @Get('me')
  async getMe(@Request() req: RequestWithUser): Promise<User> {
    return await this.usersService.getUser(req.user.id)
  }

  /**
   * PATCH /users/me
   * 自分のユーザー情報更新
   */
  @Patch('me')
  async updateMe(
    @Request() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    return await this.usersService.updateUser(req.user.id, updateUserDto)
  }

  /**
   * POST /users/me/avatar
   * アバター画像アップロード
   */
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadAvatarResponse> {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    return this.usersService.uploadAvatar(req.user.id, file)
  }

  /**
   * POST /users/me/password
   * パスワード変更
   */
  @Post('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    await this.usersService.changePassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    )
  }

  /**
   * アカウント削除
   * DELETE /users/me
   */
  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(
    @Request() req: RequestWithUser,
    @Body() deleteAccountDto: DeleteAccountDto,
  ): Promise<void> {
    await this.usersService.deleteAccount(req.user.id, deleteAccountDto.password)
  }
}
