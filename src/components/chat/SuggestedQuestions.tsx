'use client'

import React from 'react'
import { Bot } from 'lucide-react'
import ChatUtils from '@/utils/ChatUtil'

interface SuggestedQuestionsProps {
  onQuestionClick: (prompt: string) => void
  title?: string
  description?: string
}

export function SuggestedQuestions({
  onQuestionClick,
  title = 'Start Learning!',
  description = 'Ask me anything about your document. I can help explain concepts, highlight important sections, and navigate to relevant pages.',
}: SuggestedQuestionsProps) {
  const questions = ChatUtils.createSuggestedQuestions()

  return (
    <div className="text-center py-8">
      <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question.prompt)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            {question.text}
          </button>
        ))}
      </div>
    </div>
  )
}
