import {
  IsInt,
  IsOptional,
  Min,
  Max,
  IsDateString,
  IsString,
  MaxLength,
  IsUrl,
} from 'class-validator'

export class CreateRecordDto {
  @IsInt()
  recipeId!: number

  @IsOptional()
  @IsDateString()
  cookedAt?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  memo?: string

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  userImageUrl?: string
}
