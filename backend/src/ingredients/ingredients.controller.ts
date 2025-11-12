import { Controller } from '@nestjs/common'
import { IngredientsService } from '@/ingredients/ingredients.service'

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}
}
