import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from '@/app.module'
import { Request, Response, NextFunction } from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // HTTPリクエストログ
  const logger = new Logger('HTTP')
  app.use((req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl } = req
    const start = Date.now()

    res.on('finish', () => {
      const { statusCode } = res
      const duration = Date.now() - start
      logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms`)
    })

    next()
  })

  // CORS設定
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // グローバルバリデーションパイプを有効化
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTOに定義されていないプロパティを自動削除
      forbidNonWhitelisted: true, // 不正なプロパティがあればエラー
      transform: true, // 型変換を自動実行
    }),
  )

  const port = Number(process.env.PORT ?? 3000)
  await app.listen(port)
  const appLogger = new Logger('Application')
  appLogger.log(`application is running on: http://localhost:${port}`)
}
void bootstrap()
