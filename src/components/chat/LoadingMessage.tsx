'use client'

import React from 'react'
import { Bot, Loader2 } from 'lucide-react'

interface LoadingMessageProps {
  message?: string
}

export function LoadingMessage({ message = 'AI is thinking...' }: LoadingMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 max-w-[80%]">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 animate-spin" />
        </div>
        <div className="bg-gray-100 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">{message}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
