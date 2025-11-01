// src/users/dto/change-password.dto.ts
import { IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class ChangePasswordDto {
  @IsString({ message: '現在のパスワードは文字列である必要があります' })
  @MinLength(1, { message: '現在のパスワードを入力してください' })
  currentPassword: string

  @IsString({ message: '新しいパスワードは文字列である必要があります' })
  @MinLength(8, { message: '新しいパスワードは8文字以上である必要があります' })
  @MaxLength(72, { message: '新しいパスワードは72文字以下である必要があります' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: '新しいパスワードは英大文字、英小文字、数字をそれぞれ1文字以上含む必要があります',
  })
  newPassword: string
}
