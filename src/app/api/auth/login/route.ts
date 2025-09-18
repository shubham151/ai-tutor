import { NextRequest } from 'next/server'
import BackendAuthService from '@/lib/core/auth-service'
import ApiUtils from '@/lib/utils/api-utils'
import { loginSchema } from '@/lib/validations/auth'

async function handleLoginRequest(request: NextRequest) {
  const body = await ApiUtils.parseRequestBody(request)
  const { email } = ApiUtils.validateRequestBody(loginSchema, body)

  const result = await BackendAuthService.login(email)

  if (result.error) {
    ApiUtils.throwApiError(result.error, 400)
  }

  return { message: 'Login code sent to your email' }
}

export async function POST(request: NextRequest) {
  return ApiUtils.handleApiRequest(request, () => handleLoginRequest(request))
}
