import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { AuthModule } from '@/auth/auth.module'
import { PrismaModule } from '@/prisma/prisma.module'
import { UsersModule } from '@/users/users.module'
import { CsrfMiddleware } from '@/common/middleware/csrf.middleware'
import { CategoriesModule } from '@/categories/categories.module'
import { IngredientsModule } from '@/ingredients/ingredients.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全モジュールで環境変数を使用可能にする
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    IngredientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CsrfMiddleware)
      .exclude(
        { path: 'auth/signin', method: RequestMethod.POST },
        { path: 'auth/csrf', method: RequestMethod.GET },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
