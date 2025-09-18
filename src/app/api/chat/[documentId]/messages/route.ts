import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const GET = withAuth(
  async (
    userId: string,
    request: NextRequest,
    { params }: { params: Promise<{ documentId: string }> }
  ) => {
    try {
      const { documentId } = await params

      // Find or create chat session
      let chatSession = await prisma.chatSession.findFirst({
        where: {
          documentId,
          userId,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!chatSession) {
        // Create new chat session
        chatSession = await prisma.chatSession.create({
          data: {
            userId,
            documentId,
            title: 'New Chat Session',
          },
          include: {
            messages: true,
          },
        })
      }

      return NextResponse.json({ messages: chatSession.messages })
    } catch (error) {
      console.error('Get messages error:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  }
)
