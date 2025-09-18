import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Auth } from '@/lib/services/auth'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh-token')?.value

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token found' }, { status: 401 })
    }

    const newAccessToken = Auth.refreshAccessToken(refreshToken, cookieStore as any)

    if (!newAccessToken) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    }

    return NextResponse.json({
      accessToken: newAccessToken,
    })
  } catch (error) {
    console.error('Refresh API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
