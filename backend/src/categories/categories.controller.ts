import { Controller, Get } from '@nestjs/common'
import { CategoriesService } from '@/categories/categories.service'
import { CategoryResponseDto } from '@/categories/dto/category-response.dto'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * カテゴリ一覧を取得
   * GET /categories
   */
  @Get()
  async findAll(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll()
  }
}
