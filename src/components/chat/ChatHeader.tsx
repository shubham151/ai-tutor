'use client'

import React from 'react'
import { Bot } from 'lucide-react'

interface ChatHeaderProps {
  title?: string
  subtitle?: string
}

export function ChatHeader({
  title = 'AI Tutor',
  subtitle = 'Ask questions about your document',
}: ChatHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
