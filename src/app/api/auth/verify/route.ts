import { NextRequest, NextResponse } from 'next/server'
import { Auth } from '@/lib/services/auth'
import { verifySchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = verifySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid email or code format' }, { status: 400 })
    }

    const { email, code } = validation.data

    // ✅ Create a blank response so we can set cookies
    const response = NextResponse.json({})

    const result = await Auth.verify(email, code, response)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // ✅ Return a new NextResponse with cookies already set
    return NextResponse.json(
      {
        message: 'Login successful',
        accessToken: result.accessToken,
      },
      {
        status: 200,
        headers: response.headers, // preserve cookie headers set in Auth.verify
      }
    )
  } catch (error) {
    console.error('Verify API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
