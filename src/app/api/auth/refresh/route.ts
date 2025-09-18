// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Auth } from '@/lib/services/auth'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh-token')?.value

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 })
    }

    const tokenResult = Auth.refreshAccessToken(refreshToken)

    if (!tokenResult) {
      // Clear invalid refresh token
      const response = NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
      response.cookies.delete('refresh-token')
      return response
    }

    const response = NextResponse.json({
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
    })

    // Set new refresh token in cookie
    if (tokenResult.refreshToken) {
      response.cookies.set('refresh-token', tokenResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
