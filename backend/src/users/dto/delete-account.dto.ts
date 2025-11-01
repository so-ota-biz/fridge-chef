// src/users/dto/delete-account.dto.ts
import { IsString, MinLength } from 'class-validator'

export class DeleteAccountDto {
  @IsString({ message: 'パスワードは文字列である必要があります' })
  @MinLength(1, { message: 'パスワードを入力してください' })
  password: string
}
