import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(
    req: Request & { cookies?: Record<string, string | undefined> },
    _res: Response,
    next: NextFunction,
  ): void {
    const method = req.method?.toUpperCase() ?? 'GET'

    // 読み取り専用メソッドは対象外
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return next()
    }

    // サインインはトークン未発行のため除外
    const path = req.path || req.url || ''
    if (method === 'POST' && path.startsWith('/auth/signin')) {
      return next()
    }

    const rawHeader = req.headers['x-csrf-token']
    const headerToken = typeof rawHeader === 'string' ? rawHeader : undefined
    const cookieToken = req.cookies?.csrfToken as string | undefined

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      throw new ForbiddenException('Invalid CSRF token')
    }

    return next()
  }
}
