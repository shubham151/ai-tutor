import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })

    // Clear the refresh token cookie
    response.cookies.set('refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
