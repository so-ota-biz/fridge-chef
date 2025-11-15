import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  }

  async onModuleInit() {
    // NestJSアプリケーション起動時にPrismaに接続
    await this.$connect()
  }

  async onModuleDestroy() {
    // NestJSアプリケーション終了時にPrisma接続を切断
    await this.$disconnect()
  }
}
