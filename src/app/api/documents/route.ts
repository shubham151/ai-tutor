import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/documents - Get all documents for user
export const GET = withAuth(async (userId: string) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        originalName: true,
        fileUrl: true,
        pageCount: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
})

// DELETE /api/documents - Delete multiple documents (optional)
export const DELETE = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const { ids } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid document IDs' }, { status: 400 })
    }

    // Delete documents belonging to user
    const result = await prisma.document.deleteMany({
      where: {
        id: { in: ids },
        userId: userId,
      },
    })

    return NextResponse.json({
      message: `Deleted ${result.count} documents`,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Delete documents error:', error)
    return NextResponse.json({ error: 'Failed to delete documents' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
})
