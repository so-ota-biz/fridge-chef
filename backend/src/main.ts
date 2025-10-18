import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // グローバルバリデーションパイプを有効化
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTOに定義されていないプロパティを自動削除
      forbidNonWhitelisted: true, // 不正なプロパティがあればエラー
      transform: true, // 型変換を自動実行
    }),
  )

  await app.listen(3000)
  console.log('pplication is running on: http://localhost:3000')
}
bootstrap()
