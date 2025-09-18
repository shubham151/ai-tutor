import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Create a response and clear the refresh token cookie
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })

    // Clear the refresh token cookie
    response.cookies.set('refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // This expires the cookie immediately
    })

    return response
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
