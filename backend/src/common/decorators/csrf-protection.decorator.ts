import { UseGuards, applyDecorators } from '@nestjs/common'
import { CsrfProtectionGuard } from '@/common/guards/csrf-protection.guard'

export function CsrfProtection() {
  return applyDecorators(UseGuards(CsrfProtectionGuard))
}
