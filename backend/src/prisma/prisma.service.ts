import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const logLevels: Array<'query' | 'info' | 'warn' | 'error'> = process.env.PRISMA_LOG_LEVEL
      ? (process.env.PRISMA_LOG_LEVEL.split(',') as Array<'query' | 'info' | 'warn' | 'error'>)
      : ['warn', 'error'] // デフォルトは警告とエラーのみ

    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: logLevels,
    })
  }
}
