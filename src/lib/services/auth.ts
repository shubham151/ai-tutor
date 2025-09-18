import jwt from 'jsonwebtoken'
import type { TokenPayload, AuthResponse } from '@/types/auth'
import { User } from './user'
import { Otp } from './otp'

function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Environment variable ${key} is required`)
  return value
}

const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/verify', '/api/health'] as const

const TOKEN_EXPIRY = {
  access: '7d',
  refresh: '7d',
} as const

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
    console.error('❌ Refresh token verification failed:', message)
    return null
  }
}

function isValidToken(token: string): boolean {
  return !!token && verifyAccessToken(token) !== null
}

async function login(email: string): Promise<AuthResponse> {
  try {
    const userId = await User.getIdFromEmail(email)
    if (!userId) return { error: 'Failed to create user account. Please try again.' }

    const code = Otp.generate()
    const isSaved = await Otp.save(userId, code)
    if (!isSaved) return { error: 'Failed to generate login code. Please try again.' }

    const emailSent = await Otp.send(email, code)
    if (!emailSent) return { error: 'Failed to send login code. Please try again.' }

    return {}
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Something went wrong. Please try again.' }
  }
}

async function verify(
  email: string,
  code: string
): Promise<{ accessToken?: string; refreshToken?: string; error?: string }> {
  try {
    const user = await User.findByEmail(email)
    if (!user) return { error: 'User not found. Please try logging in again.' }

    const isCodeValid = await Otp.verify(user.id, code)
    if (!isCodeValid) return { error: 'Invalid or expired code. Please try again.' }

    if (!user.emailConfirmedAt) {
      const initialized = await User.init(user.id)
      if (!initialized) return { error: 'Failed to initialize user. Please try again.' }
    }

    const accessToken = createAccessToken(user.id)
    const refreshToken = createRefreshToken(user.id)

    return { accessToken, refreshToken }
  } catch (error) {
    console.error('Verify error:', error)
    return { error: 'Something went wrong. Please try again.' }
  }
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
    console.log('❌ Invalid refresh token payload, cannot generate new tokens.')
    return null
  }

  const newAccessToken = createAccessToken(payload.id)
  const newRefreshToken = createRefreshToken(payload.id)

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

export const Auth = {
  login,
  verify,
  getUserId,
  refreshAccessToken,
  isPublicRoute,
  isValidToken,
} as const

function isValidTokenDebug(token: string): boolean {
  console.log('🔍 Token validation starting...')
  console.log('🔍 Token preview:', token ? token.slice(0, 50) + '...' : 'null')

  if (!token) {
    console.log('❌ No token provided')
    return false
  }

  try {
    // Check token format
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.log('❌ Invalid JWT format - parts:', parts.length)
      return false
    }

    // Decode payload to check expiry
    const payload = JSON.parse(atob(parts[1]))
    console.log('🔍 Token payload:', payload)
    console.log('🔍 Token expires:', new Date(payload.exp * 1000))
    console.log('🔍 Current time:', new Date())
    console.log('🔍 Is expired?', payload.exp < Math.floor(Date.now() / 1000))

    // Try to verify
    const secret = getEnvVar('SECRET_ACCESS_TOKEN')
    console.log('🔍 Secret exists:', !!secret)
    console.log('🔍 Secret preview:', secret ? secret.slice(0, 10) + '...' : 'null')

    const decoded = jwt.verify(token, secret)
    console.log('✅ JWT verification successful:', decoded)

    const isValid = isValidTokenPayload(decoded)
    console.log('🔍 Payload valid?', isValid)

    return isValid
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ Token validation failed:', message)
    return false
  }
}

function refreshAccessTokenDebug(
  refreshToken: string
): { accessToken?: string; refreshToken?: string } | null {
  console.log('🔍 Starting token refresh...')
  console.log(
    '🔍 Refresh token preview:',
    refreshToken ? refreshToken.slice(0, 50) + '...' : 'null'
  )

  if (!refreshToken) {
    console.log('❌ No refresh token provided')
    return null
  }

  try {
    // Check token format
    const parts = refreshToken.split('.')
    if (parts.length !== 3) {
      console.log('❌ Invalid refresh token format - parts:', parts.length)
      return null
    }

    // Decode payload to check expiry
    const payload = JSON.parse(atob(parts[1]))
    console.log('🔍 Refresh token payload:', payload)
    console.log('🔍 Refresh token expires:', new Date(payload.exp * 1000))
    console.log('🔍 Current time:', new Date())
    console.log('🔍 Is refresh token expired?', payload.exp < Math.floor(Date.now() / 1000))

    const secret = getEnvVar('SECRET_REFRESH_TOKEN')
    console.log('🔍 Refresh secret exists:', !!secret)

    const decoded = jwt.verify(refreshToken, secret)
    console.log('✅ Refresh token verification successful:', decoded)

    const isValidPayload = isValidTokenPayload(decoded)
    console.log('🔍 Refresh payload valid?', isValidPayload)

    if (!isValidPayload) {
      console.log('❌ Invalid refresh token payload')
      return null
    }

    const newAccessToken = createAccessToken(decoded.id)
    const newRefreshToken = createRefreshToken(decoded.id)

    console.log('✅ New tokens generated successfully')
    console.log('🔍 New access token preview:', newAccessToken.slice(0, 50) + '...')

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ Refresh token failed:', message)
    return null
  }
}

// Export these debug versions
export const AuthDebug = {
  isValidToken: isValidTokenDebug,
  refreshAccessToken: refreshAccessTokenDebug,
}
