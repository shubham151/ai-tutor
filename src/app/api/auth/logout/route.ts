import { NextRequest, NextResponse } from 'next/server'
import ApiUtils from '@/lib/utils/api-utils'

function createLogoutResponse(): NextResponse {
  const response = ApiUtils.createSuccessResponse({
    message: 'Logged out successfully',
  })

  ApiUtils.clearRefreshTokenCookie(response)
  return response
}

async function handleLogoutRequest(): Promise<NextResponse> {
  return createLogoutResponse()
}

export async function POST(request: NextRequest) {
  return ApiUtils.handleApiRequest(request, () => handleLogoutRequest())
}
