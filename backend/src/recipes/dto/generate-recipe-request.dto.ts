import { IsArray, IsInt, IsOptional, Min, Max, ArrayMinSize } from 'class-validator'

/**
 * レシピ生成リクエスト
 * POST /recipes/generate
 */
export class GenerateRecipeRequestDto {
  @IsArray()
  @ArrayMinSize(2, { message: '食材を最低2つ選択してください' })
  ingredients: string[]

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  genre?: number // ジャンル（0-4）

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  difficulty?: number // 難易度（1-3）

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(180)
  cookingTime?: number // 調理時間（5-180分）

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  servings?: number // 何人分（1-10人）
}
