import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import type { RequestWithUser } from '@/auth/types/request-with-user.type'
import { User, UpdateUserResponse } from './types/user.type'
import { UpdateUserDto } from './dto/update-user.dto'

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
}
