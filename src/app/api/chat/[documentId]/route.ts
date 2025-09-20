import { NextRequest } from 'next/server'
import { withAuth } from '@/middleware'
import ChatService from '@/lib/services/chat-service'
import ApiUtils from '@/lib/utils/api-utils'

async function getChatMessages(userId: string, documentId: string) {
  const messages = await ChatService.getMessages(documentId, userId)
  return { messages }
}

async function sendChatMessage(userId: string, documentId: string, request: NextRequest) {
  const body = await ApiUtils.parseRequestBody<{ message: string; isVoice?: boolean }>(request)
  const { message, isVoice } = body

  if (!message || typeof message !== 'string') {
    ApiUtils.throwApiError('Message content is required', 400)
  }

  const response = await ChatService.sendMessage({
    documentId,
    userId,
    message,
    isVoice: Boolean(isVoice),
  })

  return response
}

export const GET = withAuth(
  async (
    userId: string,
    request: NextRequest,
    { params }: { params: Promise<{ documentId: string }> }
  ) => {
    const { documentId } = await params
    return ApiUtils.handleApiRequest(request, () => getChatMessages(userId, documentId))
  }
)

export const POST = withAuth(
  async (
    userId: string,
    request: NextRequest,
    { params }: { params: Promise<{ documentId: string }> }
  ) => {
    const { documentId } = await params
    return ApiUtils.handleApiRequest(request, () => sendChatMessage(userId, documentId, request))
  }
)
