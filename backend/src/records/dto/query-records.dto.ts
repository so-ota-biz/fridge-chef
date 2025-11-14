import { IsOptional, IsInt, Min, IsIn } from 'class-validator'
import { Transform } from 'class-transformer'
import { parseOptionalInt } from '@/common/utils/parse.util'

export class QueryRecordsDto {
  @IsOptional()
  @Transform(({ value }: { value: string | number | null | undefined }) => parseOptionalInt(value))
  @IsInt()
  recipeId?: number

  @IsOptional()
  @Transform(({ value }: { value: string | number | null | undefined }) => parseOptionalInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 20

  @IsOptional()
  @Transform(({ value }: { value: string | number | null | undefined }) => parseOptionalInt(value))
  @IsInt()
  @Min(0)
  offset?: number = 0

  @IsOptional()
  @IsIn(['cookedAt', 'createdAt'])
  sortBy?: 'cookedAt' | 'createdAt' = 'cookedAt'

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc'
}
