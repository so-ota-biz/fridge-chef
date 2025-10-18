import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello(): Promise<string> {
    // データベース接続テスト
    const userCount = await this.prisma.userProfile.count()
    return `Hello World! Users in DB: ${userCount}`
  }
}
