import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { AuthModule } from '@/auth/auth.module'
import { PrismaModule } from '@/prisma/prisma.module'
import { UsersModule } from '@/users/users.module'
import { CategoriesModule } from '@/categories/categories.module'
import { IngredientsModule } from '@/ingredients/ingredients.module'
import { AiModule } from '@/ai/ai.module'
import { RecipesModule } from '@/recipes/recipes.module'
import { RecordsModule } from '@/records/records.module'

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
    AiModule,
    RecipesModule,
    RecordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
