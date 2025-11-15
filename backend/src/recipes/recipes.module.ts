import { Module } from '@nestjs/common'
import { RecipesService } from '@/recipes/recipes.service'
import { RecipesController } from '@/recipes/recipes.controller'
import { PrismaModule } from '@/prisma/prisma.module'
import { AiModule } from '@/ai/ai.module'

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
