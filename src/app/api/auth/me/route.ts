import { NextRequest } from 'next/server'
import UserService from '@/lib/core/user-service'
import ApiUtils from '@/lib/utils/api-utils'

function validateUserId(userId: string | null): string {
  if (!userId) {
    ApiUtils.throwApiError('Unauthorized', 401)
  }
  return userId!
}

function createUserResponse(user: any) {
  return {
    id: user.id,
    email: user.email,
    emailConfirmed: !!user.emailConfirmedAt,
  }
}

async function handleMeRequest(request: NextRequest) {
  const userId = ApiUtils.getUserIdFromHeaders(request)
  const validatedUserId = validateUserId(userId)

  const user = await UserService.getById(validatedUserId)

  if (!user) {
    ApiUtils.throwApiError('User not found', 404)
  }

  return {
    user: createUserResponse(user),
  }
}

export async function GET(request: NextRequest) {
  return ApiUtils.handleApiRequest(request, () => handleMeRequest(request))
}
