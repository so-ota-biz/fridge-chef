import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ['query', 'info', 'warn', 'error'],
    })
  }

  async onModuleInit() {
    // Retry DB connect to handle transient network issues (e.g. cold starts)
    const rawUrl = process.env.DATABASE_URL ?? ''
    const safeInfo = this.safeDbInfo(rawUrl)
    const delays = [1000, 2000, 5000, 10000] // ms
    let lastError: unknown
    for (let attempt = 1; attempt <= delays.length + 1; attempt++) {
      try {
        this.logger.log(
          `Connecting to DB (${attempt}/${delays.length + 1}) host=${safeInfo.host} port=${safeInfo.port} db=${safeInfo.db}`,
        )
        await this.$connect()
        this.logger.log('Prisma connected')
        return
      } catch (err) {
        lastError = err
        const delay = delays[attempt - 1]
        this.logger.warn(
          `DB connect attempt ${attempt} failed: ${this.formatError(err)}${delay ? `; retrying in ${delay}ms` : ''}`,
        )
        if (!delay) break
        await new Promise((res) => setTimeout(res, delay))
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error(`Prisma connect failed: ${String(lastError)}`)
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  private safeDbInfo(rawUrl: string): { host: string; port: string; db: string } {
    try {
      const u = new URL(rawUrl)
      return {
        host: u.hostname,
        port: u.port || '5432',
        db: u.pathname.replace(/^\//, '') || 'postgres',
      }
    } catch {
      return { host: 'unknown', port: 'unknown', db: 'unknown' }
    }
  }

  private formatError(err: unknown): string {
    if (err instanceof Error) return err.message
    try {
      return JSON.stringify(err)
    } catch {
      return String(err)
    }
  }
}
