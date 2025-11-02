import { IsString, IsNotEmpty } from 'class-validator'

export class RefreshTokenResponseDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string

  @IsString()
  @IsNotEmpty()
  refreshToken: string
}
