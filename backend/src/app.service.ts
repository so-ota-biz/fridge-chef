import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name)
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
      this.logger.error('Database connection check failed', error)
      throw new InternalServerErrorException('Database connection failed')
    }
  }
}
