import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator'

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  displayName?: string

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string
}
