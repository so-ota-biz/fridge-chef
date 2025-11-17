/**
 * 手順（Step）
 */

/**
 * 手順
 */
export interface Step {
  id: number
  recipeId: number
  stepNumber: number
  instruction: string
  imageUrl: string | null
  tips: string | null
  createdAt: string
  updatedAt: string
}
