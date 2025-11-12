import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { IngredientResponseDto } from '@/ingredients/dto/ingredient-response.dto'

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 食材一覧を取得
   * @param categoryId カテゴリIDでフィルタ（オプショナル）
   * @returns 食材一覧（category_id, sort_order昇順）
   */
  async findAll(categoryId?: number): Promise<IngredientResponseDto[]> {
    const ingredients = await this.prisma.ingredient.findMany({
      where: categoryId
        ? {
            categoryId: categoryId,
          }
        : undefined,
      include: {
        category: true,
      },
      orderBy: [
        {
          categoryId: 'asc',
        },
        {
          sortOrder: 'asc',
        },
      ],
    })

    return ingredients
  }
}
