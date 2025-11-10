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
      next()
      return
    }

    // サインインはトークン未発行のため除外
    const path = req.path || req.url || ''
    if (
      method === 'POST' &&
      (path === '/auth/signin' || path.startsWith('/auth/signin?') || path === '/auth/signin/')
    ) {
      next()
      return
    }

    const rawHeader = req.headers['x-csrf-token']
    const headerToken = typeof rawHeader === 'string' ? rawHeader : undefined
    const cookies = req.cookies as { csrfToken?: string } | undefined
    const cookieToken = cookies?.csrfToken

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      throw new ForbiddenException('Invalid CSRF token')
    }

    next()
  }
}
