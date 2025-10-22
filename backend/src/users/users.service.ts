import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { UpdateProfileDto } from '@/users/dto/update-profile.dto'
import { UpdateProfileResponse } from '@/users/types/user-profile.type'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * ユーザーIDからプロフィールを取得
   * user_profile_view を使用してメール情報も含める
   */
  async getProfile(userId: string) {
    const profile = await this.prisma.userProfileView.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        isPremium: true,
        premiumExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!profile) {
      throw new NotFoundException('User profile not found')
    }

    return profile
  }

  /**
   * プロフィール更新
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UpdateProfileResponse> {
    const data = Object.fromEntries(
      Object.entries({
        displayName: updateProfileDto.displayName,
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
      }).filter(([_, value]) => value !== undefined),
    ) as Partial<UpdateProfileDto>

    const updatedProfile = await this.prisma.userProfile.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        displayName: true,
        firstName: true,
        lastName: true,
        updatedAt: true,
      },
    })

    return updatedProfile
  }
}
