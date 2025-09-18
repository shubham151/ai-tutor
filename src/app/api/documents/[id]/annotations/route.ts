import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/documents/[id]/annotations
export const GET = withAuth(
  async (userId: string, request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params

      // Verify document ownership
      const document = await prisma.document.findFirst({
        where: { id, userId },
      })

      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      // For now, return empty array - in production, you'd have an annotations table
      const annotations: never[] = []

      return NextResponse.json({ annotations })
    } catch (error) {
      console.error('Get annotations error:', error)
      return NextResponse.json({ error: 'Failed to fetch annotations' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  }
)

// POST /api/documents/[id]/annotations
export const POST = withAuth(
  async (userId: string, request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const body = await request.json()
      const { pageNumber, x, y, width, height, type, color } = body

      // Verify document ownership
      const document = await prisma.document.findFirst({
        where: { id, userId },
      })

      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      // Create annotation (mock implementation)
      const annotation = {
        id: Date.now().toString(),
        pageNumber,
        x,
        y,
        width,
        height,
        type,
        color,
        createdAt: new Date().toISOString(),
      }

      return NextResponse.json({ annotation })
    } catch (error) {
      console.error('Create annotation error:', error)
      return NextResponse.json({ error: 'Failed to create annotation' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  }
)
