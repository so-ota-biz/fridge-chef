import { Module } from '@nestjs/common'
import { IngredientsService } from '@/ingredients/ingredients.service'
import { IngredientsController } from '@/ingredients/ingredients.controller'
import { PrismaModule } from '@/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [IngredientsController],
  providers: [IngredientsService],
  exports: [IngredientsService],
})
export class IngredientsModule {}
