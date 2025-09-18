import { NextRequest, NextResponse } from 'next/server'
import BackendAuthService from '@/lib/core/auth-service'

function getAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return request.cookies.get('access-token')?.value || null
}

function getRefreshToken(request: NextRequest): string | null {
  return request.cookies.get('refresh-token')?.value || null
}

function createUnauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function setCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
  }
}

function setAuthCookies(response: NextResponse, accessToken: string, refreshToken?: string): void {
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieOptions = setCookieOptions(isProduction)

  response.cookies.set('access-token', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60, // 15 minutes
  })

  if (refreshToken) {
    response.cookies.set('refresh-token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })
  }
}

function createAuthenticatedResponse(userId: string, accessToken?: string): NextResponse {
  const response = NextResponse.next()
  response.headers.set('x-user-id', userId)

  if (accessToken) {
    response.headers.set('authorization', `Bearer ${accessToken}`)
  }

  return response
}

async function handleTokenRefresh(refreshToken: string): Promise<NextResponse | null> {
  try {
    const tokenResult = BackendAuthService.refreshTokens(refreshToken)

    if (!tokenResult?.accessToken) {
      return null
    }

    const isNewTokenValid = BackendAuthService.isValidToken(tokenResult.accessToken)
    if (!isNewTokenValid) {
      return null
    }

    const userId = BackendAuthService.getUserId(tokenResult.accessToken)
    if (!userId) {
      return null
    }

    const response = createAuthenticatedResponse(userId, tokenResult.accessToken)
    setAuthCookies(response, tokenResult.accessToken, tokenResult.refreshToken)

    return response
  } catch (error) {
    console.error('Token refresh error:', error)
    return null
  }
}

async function validateAccessToken(accessToken: string): Promise<NextResponse | null> {
  try {
    const isValid = BackendAuthService.isValidToken(accessToken)
    if (!isValid) {
      return null
    }

    const userId = BackendAuthService.getUserId(accessToken)
    if (!userId) {
      return null
    }

    return createAuthenticatedResponse(userId)
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (BackendAuthService.isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const accessToken = getAccessToken(request)
  const refreshToken = getRefreshToken(request)

  // Try to validate access token first
  if (accessToken) {
    const validationResult = await validateAccessToken(accessToken)
    if (validationResult) {
      return validationResult
    }
  }

  // Try to refresh token if access token is invalid
  if (refreshToken) {
    const refreshResult = await handleTokenRefresh(refreshToken)
    if (refreshResult) {
      return refreshResult
    }
  }

  return createUnauthorizedResponse()
}

export const config = {
  matcher: [
    '/((?!api/auth/login|api/auth/verify|api/auth/refresh|_next/static|_next/image|favicon.ico).*)',
  ],
}

export function getUserIdFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-user-id') || null
}

export function withAuth<T extends any[]>(
  handler: (userId: string, request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return createUnauthorizedResponse()
    }

    try {
      return await handler(userId, request, ...args)
    } catch (error) {
      console.error('Auth handler error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

export const runtime = 'nodejs'
