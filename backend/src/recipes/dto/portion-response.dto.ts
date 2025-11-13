/**
 * レシピの材料
 */
export class PortionResponseDto {
  id: number
  recipeId: number
  ingredientId: number | null // マスタ管理食材の場合
  name: string | null // ユーザー自由入力食材の場合
  amount: string // 分量
  createdAt: Date
  updatedAt: Date
}
