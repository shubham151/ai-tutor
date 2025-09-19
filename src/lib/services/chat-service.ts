// lib/services/chat-service.ts
import { PrismaClient } from '@prisma/client'
import TutorService from '@/lib/ai/tutor-service'
import { AIMessage } from '@/lib/ai/base-service'

const prisma = new PrismaClient()

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: any
  createdAt: Date
}

interface SendMessageRequest {
  documentId: string
  userId: string
  message: string
  isVoice?: boolean
}

interface SendMessageResponse {
  message: {
    id: string
    content: string
    pageReference?: number
    timestamp: Date
  }
  annotations: any[]
}

function truncateString(str: string, maxLength: number): string {
  return str.length > maxLength ? str.slice(0, maxLength) : str
}

async function findOrCreateChatSession(documentId: string, userId: string, title?: string) {
  let chatSession = await prisma.chatSession.findFirst({
    where: { documentId, userId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })

  if (!chatSession) {
    const sessionTitle = title ? truncateString(title, 50) : 'New Chat Session'

    chatSession = await prisma.chatSession.create({
      data: {
        userId,
        documentId,
        title: sessionTitle,
      },
      include: { messages: true },
    })
  }

  return chatSession
}

async function saveUserMessage(chatSessionId: string, content: string): Promise<any> {
  return await prisma.message.create({
    data: {
      chatSessionId,
      role: 'user',
      content,
    },
  })
}

async function saveAssistantMessage(
  chatSessionId: string,
  content: string,
  metadata?: any
): Promise<any> {
  return await prisma.message.create({
    data: {
      chatSessionId,
      role: 'assistant',
      content,
      metadata,
    },
  })
}

function convertToAIMessages(dbMessages: any[]): AIMessage[] {
  return dbMessages.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }))
}

async function getRecentMessages(chatSessionId: string, limit: number = 10): Promise<AIMessage[]> {
  const messages = await prisma.message.findMany({
    where: { chatSessionId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return convertToAIMessages(messages.reverse())
}

async function sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
  const { documentId, userId, message, isVoice } = request

  // Get document
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
  })

  if (!document) {
    throw new Error('Document not found')
  }

  // Find or create chat session
  const chatSession = await findOrCreateChatSession(documentId, userId, message)

  // Save user message
  await saveUserMessage(chatSession.id, message)

  // Get recent conversation history
  const recentMessages = await getRecentMessages(chatSession.id)

  // Generate AI response using tutor service
  const tutorResponse = await TutorService.generateResponse(message, {
    messages: recentMessages,
    document: {
      id: document.id,
      originalName: document.originalName,
      pageCount: document.pageCount || 1,
      extractedText: document.extractedText || '',
    },
  })

  // Save AI response with metadata
  const assistantMessage = await saveAssistantMessage(chatSession.id, tutorResponse.content, {
    pageReference: tutorResponse.pageReference,
    annotations: tutorResponse.annotations,
    confidence: tutorResponse.confidence,
    isVoice,
  })

  return {
    message: {
      id: assistantMessage.id,
      content: tutorResponse.content,
      pageReference: tutorResponse.pageReference,
      timestamp: assistantMessage.createdAt,
    },
    annotations: tutorResponse.annotations,
  }
}

async function getChatMessages(documentId: string, userId: string): Promise<ChatMessage[]> {
  const chatSession = await prisma.chatSession.findFirst({
    where: { documentId, userId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!chatSession) {
    return []
  }

  return chatSession.messages.map((message) => ({
    id: message.id,
    role: message.role as 'user' | 'assistant',
    content: message.content,
    metadata: message.metadata,
    createdAt: message.createdAt,
  }))
}

async function deleteChatSession(documentId: string, userId: string): Promise<void> {
  const chatSession = await prisma.chatSession.findFirst({
    where: { documentId, userId },
  })

  if (chatSession) {
    await prisma.message.deleteMany({
      where: { chatSessionId: chatSession.id },
    })

    await prisma.chatSession.delete({
      where: { id: chatSession.id },
    })
  }
}

async function updateChatSessionTitle(
  documentId: string,
  userId: string,
  title: string
): Promise<any> {
  return await prisma.chatSession.updateMany({
    where: { documentId, userId },
    data: { title: truncateString(title, 100) },
  })
}

const ChatService = {
  sendMessage,
  getMessages: getChatMessages,
  deleteSession: deleteChatSession,
  updateSessionTitle: updateChatSessionTitle,
}

export default ChatService
