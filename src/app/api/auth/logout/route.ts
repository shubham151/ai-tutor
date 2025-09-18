import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Auth } from '@/lib/services/auth'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    await Auth.logout(cookieStore as any)

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
