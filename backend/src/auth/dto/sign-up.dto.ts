import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class SignUpDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsString()
  @IsOptional()
  displayName?: string

  @IsString()
  @IsOptional()
  firstName?: string

  @IsString()
  @IsOptional()
  lastName?: string
}
