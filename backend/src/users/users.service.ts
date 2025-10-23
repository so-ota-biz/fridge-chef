import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { User } from './types/user.type'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * ユーザーIDからユーザーを取得
   * user_view を使用してメール情報も含める
   */
  async getUser(userId: string): Promise<User> {
    const u = await this.prisma.userView.findUnique({
      where: { id: userId },
    })
    const user = await this.prisma.userView.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
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

    return user
  }
}
