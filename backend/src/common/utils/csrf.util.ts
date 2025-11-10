import { Request } from 'express'

export interface CsrfTokens {
  cookieToken: string | undefined
  headerToken: string | undefined
}

interface RequestWithCookies extends Omit<Request, 'cookies'> {
  cookies?: Record<string, string>
}

export function extractCsrfTokens(req: Request): CsrfTokens {
  const requestWithCookies = req as RequestWithCookies
  const cookieToken: string | undefined = requestWithCookies.cookies?.csrfToken
  const headerToken: string | undefined = req.headers['x-csrf-token'] as string | undefined

  return { cookieToken, headerToken }
}

export function validateCsrfToken(tokens: CsrfTokens): boolean {
  const { cookieToken, headerToken } = tokens

  if (!cookieToken || !headerToken) {
    return false
  }

  return cookieToken === headerToken
}
