import { Controller, Get, UseGuards, Request, Patch, Body } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import type { RequestWithUser } from '@/auth/types/request-with-user.type'
import { UpdateProfileDto } from '@/users/dto/update-profile.dto'
import { UpdateProfileResponse } from '@/users/types/user-profile.type'

@Controller('users')
@UseGuards(JwtAuthGuard) // ← クラスレベルで指定するよう変更
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/profile
   * 自分のプロフィール取得（認証必須）
   */
  @Get('profile')
  async getMyProfile(@Request() req: RequestWithUser) {
    return this.usersService.getProfile(req.user.id)
  }

  /**
   * PATCH /users/profile
   * プロフィール更新（認証必須）
   */
  @Patch('profile')
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UpdateProfileResponse> {
    return this.usersService.updateProfile(req.user.id, updateProfileDto)
  }
}
