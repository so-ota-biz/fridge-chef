import { IsString, IsOptional, MaxLength } from 'class-validator'

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  displayName?: string

  @IsString()
  @IsOptional()
  @MaxLength(50)
  firstName?: string

  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string
}
