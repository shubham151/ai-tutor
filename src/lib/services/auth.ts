import jwt from 'jsonwebtoken'
import type { TokenPayload, AuthResponse } from '@/types/auth'
import { User } from './user'
import { Otp } from './otp'
import { NextResponse } from 'next/server'

function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Environment variable ${key} is required`)
  return value
}

const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/verify', '/api/health'] as const

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
} as const

const TOKEN_EXPIRY = {
  access: '15m',
  refresh: '2y',
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
  } catch {
    return null
  }
}

function isValidToken(token: string): boolean {
  return !!token && verifyAccessToken(token) !== null
}

function setCookie(res: NextResponse, token: string): void {
  res.cookies.set('refresh-token', token, COOKIE_CONFIG)
}

function clearCookie(res: NextResponse): void {
  res.cookies.delete({ name: 'refresh-token', ...COOKIE_CONFIG })
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

async function logout(res: NextResponse): Promise<{}> {
  clearCookie(res)
  return {}
}

function getUserId(token: string): string | null {
  const payload = verifyAccessToken(token)
  return payload?.id || null
}

function refreshAccessToken(refreshToken: string, res: NextResponse): string | null {
  const payload = verifyRefreshToken(refreshToken)
  if (!payload) {
    res.cookies.delete({ name: 'refresh-token', ...COOKIE_CONFIG })
    return null
  }

  const newAccessToken = createAccessToken(payload.id)
  const newRefreshToken = createRefreshToken(payload.id)

  res.cookies.set('refresh-token', newRefreshToken, COOKIE_CONFIG)
  return newAccessToken
}

export const Auth = {
  login,
  verify,
  logout,
  getUserId,
  refreshAccessToken,
  isPublicRoute,
  isValidToken,
} as const
