import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ConfigService } from '@nestjs/config'
import { Database } from '@/types/database.types'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UpdateUserResponse } from './types/user.type'

@Injectable()
export class UsersService {
  private readonly supabase: SupabaseClient<Database>

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing')
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

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
    const { data: authData, error } = await this.supabase.auth.admin.getUserById(userId)

    if (error) {
      console.error('Failed to fetch auth user:', error)
    }

    return {
      ...user,
      email: authData?.user?.email ?? null,
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
}
