import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { User } from '@/lib/services/user'

export const GET = withAuth(async (userId: string) => {
  try {
    const user = await User.getById(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: !!user.emailConfirmedAt,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Get user API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
