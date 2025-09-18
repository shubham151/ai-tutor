import { NextRequest, NextResponse } from 'next/server'
import { Auth } from '@/lib/services/auth'

// Types for middleware
interface AuthenticatedRequest extends NextRequest {
  userId?: string
}

// Helper functions
const getAuthHeader = (request: NextRequest): string | null => {
  // First try Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Fallback to cookie
  return request.cookies.get('access-token')?.value || null
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

  console.log('🔍 Middleware triggered for:', pathname)

  // Skip auth for public routes
  const isPublic = Auth.isPublicRoute(pathname)
  if (isPublic) {
    console.log('✅ Public route, skipping auth:', pathname)
    return NextResponse.next()
  }

  console.log('🔒 Protected route, checking auth:', pathname)

  // Get tokens from both Authorization header and cookies
  const accessToken = getAuthHeader(request)
  const refreshToken = getRefreshTokenFromCookies(request)

  console.log('🔍 Middleware auth check:', {
    pathname,
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenPreview: accessToken ? `${accessToken.slice(0, 20)}...` : 'none',
  })

  // Check if access token is valid
  if (accessToken) {
    console.log('🔍 Checking access token validity...')
    console.log('🔍 Environment check:', {
      hasAccessSecret: !!process.env.SECRET_ACCESS_TOKEN,
      hasRefreshSecret: !!process.env.SECRET_REFRESH_TOKEN,
    })

    try {
      const isValid = Auth.isValidToken(accessToken)
      console.log('🔍 Token valid?', isValid)

      if (isValid) {
        const userId = Auth.getUserId(accessToken)
        console.log('🔍 UserId from token:', userId)
        if (userId) {
          console.log('✅ Valid access token for user:', userId)
          const response = NextResponse.next()
          response.headers.set('x-user-id', userId)
          return response
        } else {
          console.log('❌ Access token valid but no userId found')
        }
      } else {
        console.log('❌ Access token invalid')
      }
    } catch (error) {
      console.error('❌ Token validation error:', error)
    }
  } else {
    console.log('❌ No access token found')
  }

  // Try to refresh token if we have a refresh token
  if (refreshToken) {
    try {
      console.log('🔄 Attempting token refresh with token:', refreshToken.slice(0, 20) + '...')
      const tokenResult = Auth.refreshAccessToken(refreshToken)
      console.log('🔍 Refresh result:', tokenResult ? 'success' : 'failed', tokenResult)

      if (tokenResult?.accessToken) {
        const isNewTokenValid = Auth.isValidToken(tokenResult.accessToken)
        console.log('🔍 New token valid?', isNewTokenValid)

        if (isNewTokenValid) {
          const userId = Auth.getUserId(tokenResult.accessToken)
          console.log('🔍 UserId from new token:', userId)
          if (userId) {
            console.log('✅ Token refreshed for user:', userId)
            const response = NextResponse.next()
            response.headers.set('x-user-id', userId)
            response.headers.set('authorization', `Bearer ${tokenResult.accessToken}`)

            // Set new tokens in cookies for future requests
            response.cookies.set('access-token', tokenResult.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 15 * 60, // 15 minutes
            })

            if (tokenResult.refreshToken) {
              response.cookies.set('refresh-token', tokenResult.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60, // 7 days
              })
            }

            return response
          }
        }
      } else {
        console.log('❌ Token refresh failed - no access token in result')
      }
    } catch (error) {
      console.error('❌ Token refresh error details:', error)
    }
  } else {
    console.log('❌ No refresh token available')
  }

  console.log('🚫 No valid authentication found, returning 401')
  return createUnauthorizedResponse()
}

// Middleware config
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api/auth/login, api/auth/verify, api/auth/refresh (auth endpoints)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api/auth/login|api/auth/verify|api/auth/refresh|_next/static|_next/image|favicon.ico).*)',
  ],
}

// Utility function to extract user ID from request in API routes
export const getUserIdFromRequest = (request: NextRequest): string | null => {
  return request.headers.get('x-user-id') || null
}

// Higher-order function for protecting API routes
export const withAuth = <T extends any[]>(
  handler: (userId: string, request: NextRequest, ...args: T) => Promise<NextResponse>
) => {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return createUnauthorizedResponse()
    }

    try {
      // FIXED: Pass request as second parameter after userId
      return await handler(userId, request, ...args)
    } catch (error) {
      console.error('Auth handler error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

export const runtime = 'nodejs'
