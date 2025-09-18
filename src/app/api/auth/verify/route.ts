// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Auth } from '@/lib/services/auth'
import { User } from '@/lib/services/user'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    const result = await Auth.verify(email, code)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    if (!result.accessToken || !result.refreshToken) {
      return NextResponse.json({ error: 'Failed to generate tokens' }, { status: 500 })
    }

    // Get user data to return with tokens
    const user = await User.findByEmail(email)

    const response = NextResponse.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: user
        ? {
            id: user.id,
            email: user.email,
            emailConfirmed: !!user.emailConfirmedAt,
          }
        : undefined,
    })

    // Set refresh token in httpOnly cookie
    response.cookies.set('refresh-token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
