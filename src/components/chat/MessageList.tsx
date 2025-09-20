'use client'

import React from 'react'
import { MessageBubble } from './MessageBubble'
import { LoadingMessage } from './LoadingMessage'
import { SuggestedQuestions } from './SuggestedQuestions'
import Alert from '@/components/ui/Alert'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  metadata?: {
    pageReference?: number
  }
}

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  error?: string
  onPageClick: (page: number) => void
  onQuestionClick: (prompt: string) => void
  onErrorDismiss?: () => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export function MessageList({
  messages,
  isLoading,
  error,
  onPageClick,
  onQuestionClick,
  onErrorDismiss,
  messagesEndRef,
}: MessageListProps) {
  const hasMessages = messages.length > 0

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {!hasMessages && <SuggestedQuestions onQuestionClick={onQuestionClick} />}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onPageClick={onPageClick} />
      ))}

      {isLoading && <LoadingMessage />}

      {error && (
        <Alert variant="error" dismissible onDismiss={onErrorDismiss}>
          {error}
        </Alert>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
