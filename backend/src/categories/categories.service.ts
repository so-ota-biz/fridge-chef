import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { CategoryResponseDto } from '@/categories/dto/category-response.dto'

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * カテゴリ一覧を取得
   * @returns カテゴリ一覧（sort_order昇順）
   */
  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return categories
  }
}
