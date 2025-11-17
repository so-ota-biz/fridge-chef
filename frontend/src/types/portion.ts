/**
 * 材料（Portion）
 */
export interface Portion {
  id: number
  recipeId: number
  ingredientId: number | null // nullの場合はカスタム食材
  name: string | null // カスタム食材名（ingredientIdがnullの場合に使用）
  amount: string
  createdAt: string
  updatedAt: string
}
