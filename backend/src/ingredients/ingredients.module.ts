import { Module } from '@nestjs/common'
import { IngredientsService } from '@/ingredients/ingredients.service'
import { IngredientsController } from '@/ingredients/ingredients.controller'

@Module({
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule {}
