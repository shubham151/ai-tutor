import { NextRequest } from 'next/server'
import BackendAuthService from '@/lib/core/auth-service'
import UserService from '@/lib/core/user-service'
import ApiUtils from '@/lib/utils/api-utils'
import { verifySchema } from '@/lib/validations/auth'

function createUserResponse(user: any) {
  return {
    id: user.id,
    email: user.email,
    emailConfirmed: !!user.emailConfirmedAt,
  }
}

async function getUserData(email: string) {
  const user = await UserService.findByEmail(email)
  return user ? createUserResponse(user) : undefined
}

async function createVerifyResponse(accessToken: string, refreshToken: string, user: any) {
  const response = ApiUtils.createSuccessResponse({
    accessToken,
    refreshToken,
    user,
  })

  ApiUtils.setRefreshTokenCookie(response, refreshToken)
  return response
}

async function handleVerifyRequest(request: NextRequest) {
  const body = await ApiUtils.parseRequestBody(request)
  const { email, code } = ApiUtils.validateRequestBody(verifySchema, body)

  const result = await BackendAuthService.verify(email, code)

  if (result.error) {
    ApiUtils.throwApiError(result.error, 400)
  }

  if (!result.accessToken || !result.refreshToken) {
    ApiUtils.throwApiError('Failed to generate tokens', 500)
  }

  const user = await getUserData(email)

  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await ApiUtils.parseRequestBody(request)
    const { email, code } = ApiUtils.validateRequestBody(verifySchema, body)

    const result = await BackendAuthService.verify(email, code)

    if (result.error) {
      return ApiUtils.createErrorResponse(result.error, 400)
    }

    if (!result.accessToken || !result.refreshToken) {
      return ApiUtils.createErrorResponse('Failed to generate tokens', 500)
    }

    const user = await getUserData(email)
    const response = ApiUtils.createSuccessResponse({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user,
    })

    ApiUtils.setRefreshTokenCookie(response, result.refreshToken)
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return ApiUtils.createErrorResponse(message, 500)
  }
}
