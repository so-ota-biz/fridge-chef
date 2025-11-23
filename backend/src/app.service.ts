import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    // 疎通テスト
    return `Hello World! App is running!`
  }

  async dbCheck(): Promise<string> {
    // データベース接続テスト
    const userCount = await this.prisma.user.count()
    return `Hello World! Users in DB: ${userCount}`
  }
}
