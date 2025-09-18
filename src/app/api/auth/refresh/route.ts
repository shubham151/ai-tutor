import { NextRequest, NextResponse } from 'next/server'
import BackendAuthService from '@/lib/core/auth-service'
import ApiUtils from '@/lib/utils/api-utils'

function validateRefreshToken(refreshToken: string | null): string {
  if (!refreshToken) {
    ApiUtils.throwApiError('No refresh token provided', 401)
  }
  return refreshToken!
}

function handleInvalidToken(): NextResponse {
  const response = ApiUtils.createErrorResponse('Invalid refresh token', 401)
  ApiUtils.clearRefreshTokenCookie(response)
  return response
}

async function handleRefreshRequest(request: NextRequest) {
  const refreshToken = ApiUtils.getRefreshTokenFromCookies(request)
  const validatedToken = validateRefreshToken(refreshToken)

  const tokenResult = BackendAuthService.refreshTokens(validatedToken)

  if (!tokenResult) {
    return handleInvalidToken()
  }

  return {
    accessToken: tokenResult.accessToken,
    refreshToken: tokenResult.refreshToken,
  }
}

export async function POST(request: NextRequest) {
  return ApiUtils.handleApiRequest(request, async () => {
    const refreshToken = ApiUtils.getRefreshTokenFromCookies(request)
    const validatedToken = validateRefreshToken(refreshToken)

    const tokenResult = BackendAuthService.refreshTokens(validatedToken)

    if (!tokenResult) {
      const response = ApiUtils.createErrorResponse('Invalid refresh token', 401)
      ApiUtils.clearRefreshTokenCookie(response)
      throw response
    }

    const result = {
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
    }

    const response = ApiUtils.createSuccessResponse(result)

    if (tokenResult.refreshToken) {
      ApiUtils.setRefreshTokenCookie(response, tokenResult.refreshToken)
    }

    return response
  })
}
