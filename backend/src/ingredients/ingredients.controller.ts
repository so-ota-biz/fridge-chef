import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common'
import { IngredientsService } from '@/ingredients/ingredients.service'
import { IngredientResponseDto } from '@/ingredients/dto/ingredient-response.dto'

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  /**
   * 食材一覧を取得
   * GET /ingredients
   * GET /ingredients?categoryId=1
   *
   * @param categoryId カテゴリIDでフィルタ（クエリパラメータ、オプショナル）
   */
  @Get()
  async findAll(
    @Query('categoryId', new ParseIntPipe({ optional: true }))
    categoryId?: number,
  ): Promise<IngredientResponseDto[]> {
    return this.ingredientsService.findAll(categoryId)
  }
}
