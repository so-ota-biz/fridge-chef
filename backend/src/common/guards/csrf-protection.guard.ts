import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common'
import type { Request } from 'express'
import { extractCsrfTokens, validateCsrfToken } from '@/common/utils/csrf.util'

@Injectable()
export class CsrfProtectionGuard implements CanActivate {
  private readonly logger = new Logger(CsrfProtectionGuard.name)

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()

    const tokens = extractCsrfTokens(request)
    const isValid = validateCsrfToken(tokens)

    if (!isValid) {
      this.logger.warn(`CSRF token validation failed for ${request.method} ${request.url}`)
      throw new UnauthorizedException('CSRF token validation failed')
    }

    this.logger.debug(`CSRF token validation passed for ${request.method} ${request.url}`)
    return true
  }
}
