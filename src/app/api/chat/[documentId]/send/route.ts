import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware'
import { PrismaClient } from '@prisma/client'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { z } from 'zod'

const prisma = new PrismaClient()

export const POST = withAuth(
  async (
    userId: string,
    request: NextRequest,
    { params }: { params: Promise<{ documentId: string }> }
  ) => {
    try {
      const { documentId } = await params
      const { message, isVoice } = await request.json()

      // Get document and extract context
      const document = await prisma.document.findFirst({
        where: { id: documentId, userId },
      })

      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      // Find or create chat session
      let chatSession = await prisma.chatSession.findFirst({
        where: {
          documentId,
          userId,
        },
      })

      if (!chatSession) {
        chatSession = await prisma.chatSession.create({
          data: {
            userId,
            documentId,
            title: message.slice(0, 50),
          },
        })
      }

      // Save user message
      await prisma.message.create({
        data: {
          chatSessionId: chatSession.id,
          role: 'user',
          content: message,
        },
      })

      // Get recent messages for context
      const recentMessages = await prisma.message.findMany({
        where: { chatSessionId: chatSession.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })

      // Prepare context for AI
      const conversationHistory = recentMessages.reverse().map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))

      const systemPrompt = `You are an AI tutor helping students understand documents. 

Document context:
- Document name: ${document.originalName}
- Total pages: ${document.pageCount}
- Document text preview: ${document.extractedText?.slice(0, 2000) || 'Not available'}

Your capabilities:
1. Answer questions about the document content
2. Reference specific pages when relevant
3. Suggest highlights or annotations to help learning
4. Provide clear explanations of concepts

When referencing content:
- Include page numbers when possible
- Suggest highlighting important sections
- Use simple, clear language
- Be encouraging and supportive

Current user question: ${message}`

      // Generate AI response with Gemini
      const result = await generateText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        messages: conversationHistory,
        temperature: 0.7,
      })

      // Extract page references and create annotations
      let pageReference: number | undefined
      let annotations: any[] = []

      // Simple logic to extract page numbers and create highlights
      const pageMatch = result.text.match(/page (\d+)/i)
      if (pageMatch) {
        pageReference = parseInt(pageMatch[1])

        // Create a highlight annotation for the referenced page
        annotations.push({
          pageNumber: pageReference,
          x: 0.1,
          y: 0.5,
          width: 0.8,
          height: 0.1,
          type: 'highlight',
          color: '#ffff00',
        })
      }

      // Save AI response
      const assistantMessage = await prisma.message.create({
        data: {
          chatSessionId: chatSession.id,
          role: 'assistant',
          content: result.text,
          metadata: {
            pageReference,
            annotations,
          },
        },
      })

      return NextResponse.json({
        message: {
          id: assistantMessage.id,
          content: result.text,
          pageReference,
          timestamp: assistantMessage.createdAt,
        },
        annotations,
      })
    } catch (error) {
      console.error('Send message error:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  }
)
