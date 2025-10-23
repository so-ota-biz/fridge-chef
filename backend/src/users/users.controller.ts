import { Controller, Get, UseGuards, Request } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { RequestWithUser } from '@/auth/types/request-with-user.type'
import { User } from './types/user.type'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * 自分のユーザー情報取得
   */
  @Get('me')
  async getMe(@Request() req: RequestWithUser): Promise<User> {
    return this.usersService.getUser(req.user.id)
  }
}
