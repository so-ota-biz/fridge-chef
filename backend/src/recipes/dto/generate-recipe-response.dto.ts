import { RecipeResponseDto } from '@/recipes/dto/recipe-response.dto'

/**
 * レシピ生成レスポンス（3件のレシピ）
 * POST /recipes/generate
 */
export class GenerateRecipeResponseDto {
  recipes: RecipeResponseDto[]
}
