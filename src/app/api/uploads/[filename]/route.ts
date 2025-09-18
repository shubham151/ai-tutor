// src/app/api/uploads/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware'
import { PrismaClient } from '@prisma/client'
import { readFile } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

export const GET = withAuth(
  async (
    userId: string,
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
  ) => {
    try {
      const { filename } = await params

      // Verify user owns this file
      const document = await prisma.document.findFirst({
        where: {
          filename,
          userId,
        },
      })

      if (!document) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }

      // Read the file
      const filepath = join(process.cwd(), 'uploads', filename)

      try {
        const fileBuffer = await readFile(filepath)

        // Return the PDF with proper headers
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Length': fileBuffer.length.toString(),
            'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
            'Content-Disposition': `inline; filename="${document.originalName}"`,
          },
        })
      } catch (fileError) {
        console.error('File read error:', fileError)
        return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
      }
    } catch (error) {
      console.error('PDF serve error:', error)
      return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  }
)
