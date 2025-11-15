import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
import { extractCsrfTokens, validateCsrfToken } from '@/common/utils/csrf.util'

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const method = req.method?.toUpperCase() ?? 'GET'

    // 読み取り専用メソッドは対象外
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      next()
      return
    }

    // CSRF検証
    const tokens = extractCsrfTokens(req)
    const isValid = validateCsrfToken(tokens)

    if (!isValid) {
      throw new ForbiddenException('Invalid CSRF token')
    }

    next()
  }
}
