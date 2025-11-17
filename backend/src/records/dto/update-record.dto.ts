import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsString,
  MaxLength,
  IsUrl,
  ValidateIf,
} from 'class-validator'

export class UpdateRecordDto {
  @IsOptional()
  @IsDateString()
  cookedAt?: string

  @IsOptional()
  @ValidateIf((o: UpdateRecordDto) => o.rating !== null)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number | null

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  memo?: string

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  userImageUrl?: string
}
