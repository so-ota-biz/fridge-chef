import { PortionResponseDto } from '@/recipes/dto/portion-response.dto'
import { StepResponseDto } from '@/recipes/dto/step-response.dto'

/**
 * レシピ詳細
 */
export class RecipeResponseDto {
  id: number
  title: string
  description: string | null
  cookingTime: number
  difficulty: number
  servings: number
  imageUrl: string | null
  imagePrompt: string | null
  genre: number
  calories: number | null
  createdAt: Date
  updatedAt: Date
  portions?: PortionResponseDto[] // 材料リスト
  steps?: StepResponseDto[] // 手順リスト
}
