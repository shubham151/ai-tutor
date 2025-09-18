import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware'
import { PrismaClient } from '@prisma/client'
import { unlink } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

// GET /api/documents/[id] - Get single document
export const GET = withAuth(
  async (userId: string, request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params

      const document = await prisma.document.findFirst({
        where: {
          id,
          userId,
        },
      })

      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      return NextResponse.json({ document })
    } catch (error) {
      console.error('Get document error:', error)
      return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  }
)

// DELETE /api/documents/[id] - Delete single document
export const DELETE = withAuth(
  async (userId: string, request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params

      // Find document first to get file info
      const document = await prisma.document.findFirst({
        where: {
          id,
          userId,
        },
      })

      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      // Delete from database
      await prisma.document.delete({
        where: { id },
      })

      // Delete physical file
      try {
        const filepath = join(process.cwd(), 'uploads', document.filename)
        await unlink(filepath)
      } catch (fileError) {
        console.warn('Failed to delete physical file:', fileError)
        // Continue even if file deletion fails
      }

      return NextResponse.json({
        message: 'Document deleted successfully',
        documentId: id,
      })
    } catch (error) {
      console.error('Delete document error:', error)
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  }
)

// PUT /api/documents/[id] - Update document (optional)
export const PUT = withAuth(
  async (userId: string, request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const { originalName } = await request.json()

      const document = await prisma.document.findFirst({
        where: {
          id,
          userId,
        },
      })

      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      const updatedDocument = await prisma.document.update({
        where: { id },
        data: {
          originalName: originalName || document.originalName,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({ document: updatedDocument })
    } catch (error) {
      console.error('Update document error:', error)
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  }
)
