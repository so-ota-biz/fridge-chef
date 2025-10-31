import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator'

export class SignUpDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'パスワードは英大文字、英小文字、数字をそれぞれ1文字以上含む必要があります',
  })
  password: string

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
