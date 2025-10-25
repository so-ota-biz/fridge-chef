import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ConfigService } from '@nestjs/config'
import { Database } from '@/types/database.types'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UpdateUserResponse } from './types/user.type'

@Injectable()
export class UsersService {
  private readonly supabaseAdmin: SupabaseClient<Database>

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing')
    }

    this.supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
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
    const { data: authData, error } = await this.supabaseAdmin.auth.admin.getUserById(userId)

    if (error || !authData?.user?.email) {
      throw new UnauthorizedException('Failed to fetch user email')
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
