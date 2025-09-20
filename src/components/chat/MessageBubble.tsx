'use client'

import React from 'react'
import { marked } from 'marked'
import { Bot, User } from 'lucide-react'
import ChatUtils from '@/utils/ChatUtil'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  metadata?: {
    pageReference?: number
  }
}

interface MessageBubbleProps {
  message: Message
  onPageClick?: (page: number) => void
}

export function MessageBubble({ message, onPageClick }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const formattedTime = ChatUtils.formatTime(message.createdAt)

  marked.setOptions({
    breaks: true,
    gfm: true,
    async: false,
  })

  const htmlContent =
    typeof marked(message.content) === 'string'
      ? (marked(message.content) as string)
      : message.content

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <MessageAvatar isUser={isUser} />
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
          }`}
        >
          <MessageContent htmlContent={htmlContent} />
          <PageReferenceButton
            pageReference={message.metadata?.pageReference}
            onPageClick={onPageClick}
          />
          <MessageTimestamp time={formattedTime} isUser={isUser} />
        </div>
      </div>
    </div>
  )
}

function MessageAvatar({ isUser }: { isUser: boolean }) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-blue-500 text-white'
          : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
      }`}
    >
      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
    </div>
  )
}

function MessageContent({ htmlContent }: { htmlContent: string }) {
  return (
    <div
      className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}

function PageReferenceButton({
  pageReference,
  onPageClick,
}: {
  pageReference?: number
  onPageClick?: (page: number) => void
}) {
  if (!pageReference || !onPageClick) return null

  return (
    <button
      onClick={() => onPageClick(pageReference)}
      className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
    >
      Go to page {pageReference}
    </button>
  )
}

function MessageTimestamp({ time, isUser }: { time: string; isUser: boolean }) {
  return <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>{time}</div>
}
