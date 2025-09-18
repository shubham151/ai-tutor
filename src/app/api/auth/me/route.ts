// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/services/user'
import { getUserIdFromRequest } from '@/middleware'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)

    console.log('🔍 /api/auth/me - userId from middleware:', userId)

    if (!userId) {
      console.log('❌ No userId found in request headers')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.getById(userId)

    if (!user) {
      console.log('❌ User not found:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ User found:', { id: user.id, email: user.email })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: !!user.emailConfirmedAt,
      },
    })
  } catch (error) {
    console.error('❌ /api/auth/me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
