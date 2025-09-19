// app/core/chat-service.ts
import Api from './Api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: any
}

interface ChatResponse {
  message: {
    id: string
    content: string
    pageReference?: number
    timestamp: string
  }
  annotations: any[]
}

async function getChatHistory(documentId: string): Promise<Message[]> {
  try {
    const response = await Api.get<{ messages: Message[] }>(`/api/chat/${documentId}`)
    return response.messages || []
  } catch (error) {
    console.error('Failed to load chat history:', error)
    return []
  }
}

async function sendMessage(
  documentId: string,
  content: string,
  isVoice = false
): Promise<ChatResponse> {
  const response = await Api.post<ChatResponse>(`/api/chat/${documentId}`, {
    message: content,
    isVoice,
  })
  return response
}

const ChatService = {
  getChatHistory,
  sendMessage,
}

export default ChatService
