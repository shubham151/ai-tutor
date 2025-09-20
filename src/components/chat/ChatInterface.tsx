'use client'

import React, { useEffect } from 'react'
import {
  useChatState,
  useVoiceRecording,
  useChatOperations,
  useMessageHandling,
} from '@/hooks/chat-hooks'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import ChatUtils from '@/utils/ChatUtil'

interface ChatInterfaceProps {
  documentId: string
  onAnnotationRequest?: (annotation: any) => void
  onPageNavigate?: (page: number) => void
  className?: string
}

function ChatInterface({
  documentId,
  onAnnotationRequest,
  onPageNavigate,
  className = '',
}: ChatInterfaceProps) {
  const chatState = useChatState()
  const voiceRecording = useVoiceRecording()
  const chatOps = useChatOperations(documentId)
  const messageHandling = useMessageHandling()

  useEffect(() => {
    loadInitialMessages()
  }, [documentId])

  useEffect(() => {
    messageHandling.scrollToBottom()
  }, [chatState.messages, messageHandling])

  const loadInitialMessages = async () => {
    try {
      const messages = await chatOps.loadChatHistory()
      chatState.setMessages(messages)
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const handleSendMessage = async (content: string, isVoice = false) => {
    if (!ChatUtils.isValidMessageContent(content) || chatState.isLoading) return

    const userMessage = messageHandling.createUserMessage(content)
    chatState.addMessage(userMessage)
    chatState.clearInput()
    chatState.setLoading(true)
    chatState.clearError()

    try {
      const response = await chatOps.sendMessage(content, isVoice)
      const assistantMessage = messageHandling.createAssistantMessage(response)

      chatState.addMessage(assistantMessage)

      // Handle annotations and navigation
      if (response.annotations?.length > 0) {
        response.annotations.forEach(onAnnotationRequest as any)

        if (!response.message.pageReference && response.annotations[0]?.pageNumber) {
          onPageNavigate?.(response.annotations[0].pageNumber)
        }
      }

      if (response.message.pageReference) {
        onPageNavigate?.(response.message.pageReference)
      }

      // Text-to-speech
      messageHandling.speakMessage(response.message.content)
    } catch (error) {
      chatState.setError('Failed to send message. Please try again.')
      console.error('Chat error:', error)
    } finally {
      chatState.setLoading(false)
    }
  }

  const handleVoiceRecording = async () => {
    if (voiceRecording.isRecording) {
      try {
        const audioBlob = await voiceRecording.stopRecording()
        if (audioBlob) {
          chatState.setLoading(true)
          const transcription = await chatOps.transcribeAudio(audioBlob)
          if (transcription) {
            await handleSendMessage(transcription, true)
          }
        }
      } catch (error) {
        chatState.setError('Failed to transcribe audio. Please try typing instead.')
        console.error('Transcription error:', error)
      } finally {
        chatState.setLoading(false)
      }
    } else {
      const success = await voiceRecording.startRecording()
      if (!success) {
        chatState.setError('Failed to access microphone. Please check permissions.')
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(chatState.inputValue)
    }
  }

  const handlePageClick = (pageNumber: number) => {
    onPageNavigate?.(pageNumber)
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      <ChatHeader />

      <MessageList
        messages={chatState.messages}
        isLoading={chatState.isLoading}
        error={chatState.error}
        onPageClick={handlePageClick}
        onQuestionClick={handleSendMessage}
        onErrorDismiss={chatState.clearError}
        messagesEndRef={messageHandling.messagesEndRef}
      />

      <ChatInput
        value={chatState.inputValue}
        onChange={chatState.setInput}
        onSubmit={() => handleSendMessage(chatState.inputValue)}
        onKeyPress={handleKeyPress}
        isLoading={chatState.isLoading}
        isRecording={voiceRecording.isRecording}
        onStartRecording={handleVoiceRecording}
        onStopRecording={handleVoiceRecording}
      />
    </div>
  )
}

export default ChatInterface
