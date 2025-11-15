/**
 * レシピの手順
 */
export class StepResponseDto {
  id: number
  recipeId: number
  stepNumber: number
  instruction: string
  imageUrl: string | null
  tips: string | null
  createdAt: Date
  updatedAt: Date
}
