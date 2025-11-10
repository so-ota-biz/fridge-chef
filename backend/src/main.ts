import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'
import { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'

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

  // CORS設定（Cookie送信を許可）
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })

  // Cookieパーサ
  app.use(cookieParser())

  // グローバルバリデーションパイプを有効化
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTOに定義されていないプロパティを自動削除
      forbidNonWhitelisted: true, // 不正なプロパティがあればエラー
      transform: true, // 型変換を自動実行
    }),
  )

  await app.listen(3000)
  const appLogger = new Logger('Application')
  appLogger.log('application is running on: http://localhost:3000')
}
void bootstrap()
