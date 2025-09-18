// middleware.ts (Next.js 13+)
import { NextRequest, NextResponse } from 'next/server'
import { Auth } from '@/lib/services/auth'

// Types for middleware
interface AuthenticatedRequest extends NextRequest {
  userId?: string
}

// Helper functions
const getAuthHeader = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization')
  return authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
}

const getRefreshTokenFromCookies = (request: NextRequest): string | null => {
  return request.cookies.get('refresh-token')?.value || null
}

const createAuthResponse = (response: NextResponse, accessToken: string): NextResponse => {
  response.headers.set('authorization', `Bearer ${accessToken}`)
  return response
}

const createUnauthorizedResponse = (): NextResponse => {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth for public routes
  if (Auth.isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Get tokens
  const accessToken = getAuthHeader(request)
  const refreshToken = getRefreshTokenFromCookies(request)

  // Check if access token is valid
  if (accessToken && Auth.isValidToken(accessToken)) {
    const userId = Auth.getUserId(accessToken)
    if (userId) {
      const response = NextResponse.next()
      response.headers.set('x-user-id', userId)
      return response
    }
  }

  // Try to refresh token if we have a refresh token
  if (refreshToken) {
    // Create a temporary cookies object for the refresh function
    const mockCookies = {
      set: () => {},
      delete: () => {},
      get: () => ({ value: refreshToken }),
    } as any

    const newAccessToken = Auth.refreshAccessToken(refreshToken, mockCookies)

    if (newAccessToken) {
      const userId = Auth.getUserId(newAccessToken)
      if (userId) {
        const response = NextResponse.next()
        response.headers.set('x-user-id', userId)
        response.headers.set('authorization', `Bearer ${newAccessToken}`)
        return response
      }
    }
  }

  // No valid token found
  return createUnauthorizedResponse()
}

// Middleware config
export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico|public).*)'],
}

// Utility function to extract user ID from request in API routes
export const getUserIdFromRequest = (request: NextRequest): string | null => {
  return request.headers.get('x-user-id') || null
}

// Higher-order function for protecting API routes
export const withAuth = <T extends any[]>(
  handler: (userId: string, ...args: T) => Promise<Response | NextResponse>
) => {
  return async (request: NextRequest, ...args: T): Promise<Response | NextResponse> => {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return createUnauthorizedResponse()
    }

    try {
      return await handler(userId, ...args)
    } catch (error) {
      console.error('Auth handler error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
