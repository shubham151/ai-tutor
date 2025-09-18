import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

interface ApiError {
  message: string
  status: number
}

interface CookieConfig {
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax' | 'strict' | 'none'
  path: string
  maxAge: number
}

function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status })
}

function createCookieConfig(maxAge: number): CookieConfig {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  }
}

function setRefreshTokenCookie(response: NextResponse, token: string): void {
  const config = createCookieConfig(7 * 24 * 60 * 60) // 7 days
  response.cookies.set('refresh-token', token, config)
}

function clearRefreshTokenCookie(response: NextResponse): void {
  const config = createCookieConfig(0)
  response.cookies.set('refresh-token', '', config)
}

function getRefreshTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('refresh-token')?.value || null
}

function getUserIdFromHeaders(request: NextRequest): string | null {
  return request.headers.get('x-user-id') || null
}

async function parseRequestBody<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json()
  } catch {
    throw new Error('Invalid JSON body')
  }
}

function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) {
    throw new Error('Invalid request data')
  }
  return result.data
}

async function handleApiRequest<T>(
  request: NextRequest,
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    const result = await handler()
    return createSuccessResponse(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = error instanceof Error && 'status' in error ? (error as any).status : 500
    return createErrorResponse(message, status)
  }
}

function createApiError(message: string, status: number = 400): ApiError {
  return { message, status }
}

function throwApiError(message: string, status: number = 400): never {
  const error = new Error(message) as Error & { status: number }
  error.status = status
  throw error
}

const ApiUtils = {
  createErrorResponse,
  createSuccessResponse,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookies,
  getUserIdFromHeaders,
  parseRequestBody,
  validateRequestBody,
  handleApiRequest,
  createApiError,
  throwApiError,
}

export default ApiUtils
