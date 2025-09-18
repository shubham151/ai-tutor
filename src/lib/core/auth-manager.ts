import jwt from 'jsonwebtoken'

interface TokenPayload {
  id: string
}

interface AuthResponse {
  error?: string
}

const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/verify', '/api/health'] as const

const TOKEN_EXPIRY = {
  access: '7d',
  refresh: '7d',
} as const

function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Environment variable ${key} is required`)
  return value
}

function isPublicRoute(pathname: string): boolean {
  return !pathname.startsWith('/api') || PUBLIC_ROUTES.includes(pathname as any)
}

function createTokenPayload(userId: string): TokenPayload {
  return { id: userId }
}

function isValidTokenPayload(payload: any): payload is TokenPayload {
  return payload && typeof payload.id === 'string'
}

function createAccessToken(userId: string): string {
  return jwt.sign(createTokenPayload(userId), getEnvVar('SECRET_ACCESS_TOKEN'), {
    expiresIn: TOKEN_EXPIRY.access,
  })
}

function createRefreshToken(userId: string): string {
  return jwt.sign(createTokenPayload(userId), getEnvVar('SECRET_REFRESH_TOKEN'), {
    expiresIn: TOKEN_EXPIRY.refresh,
  })
}

function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getEnvVar('SECRET_ACCESS_TOKEN'))
    return isValidTokenPayload(decoded) ? decoded : null
  } catch {
    return null
  }
}

function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getEnvVar('SECRET_REFRESH_TOKEN'))
    return isValidTokenPayload(decoded) ? decoded : null
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Refresh token verification failed:', message)
    return null
  }
}

function isValidToken(token: string): boolean {
  return !!token && verifyAccessToken(token) !== null
}

function getUserId(token: string): string | null {
  const payload = verifyAccessToken(token)
  return payload?.id || null
}

function refreshAccessToken(
  refreshToken: string
): { accessToken?: string; refreshToken?: string } | null {
  const payload = verifyRefreshToken(refreshToken)
  if (!payload) {
    console.log('Invalid refresh token payload, cannot generate new tokens.')
    return null
  }

  const newAccessToken = createAccessToken(payload.id)
  const newRefreshToken = createRefreshToken(payload.id)

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

const AuthManager = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getUserId,
  refreshAccessToken,
  isPublicRoute,
  isValidToken,
}

export default AuthManager
