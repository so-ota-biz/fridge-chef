import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { InternalServerErrorException } from '@nestjs/common'

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    // 疎通テスト
    return `Hello World! App is running!`
  }

  async dbCheck(): Promise<string> {
    // データベース接続テスト
    try {
      await this.prisma.user.count()
      return 'Database connection OK'
    } catch (error) {
      throw new InternalServerErrorException('Database connection failed')
    }
  }
}
