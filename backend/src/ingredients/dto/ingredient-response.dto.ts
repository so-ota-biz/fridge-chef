import { CategoryResponseDto } from '@/categories/dto/category-response.dto'

export class IngredientResponseDto {
  id: number
  name: string
  categoryId: number
  icon: string | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  category?: CategoryResponseDto // カテゴリ情報（オプショナル）
}
