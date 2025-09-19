// components/chat/ChatInterface.tsx
'use client'

import React, { useEffect } from 'react'
import { Send, Mic, MicOff, Loader2, Bot, User } from 'lucide-react'
import {
  useChatState,
  useVoiceRecording,
  useChatOperations,
  useMessageHandling,
} from '@/hooks/chat-hooks'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import ChatUtils from '@/lib/utils/ChatUtil'

interface ChatInterfaceProps {
  documentId: string
  onAnnotationRequest?: (annotation: any) => void
  onPageNavigate?: (page: number) => void
  className?: string
}

function ChatHeader() {
  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI Tutor</h3>
          <p className="text-xs text-gray-500">Ask questions about your document</p>
        </div>
      </div>
    </div>
  )
}

function SuggestedQuestions({ onQuestionClick }: { onQuestionClick: (prompt: string) => void }) {
  const questions = ChatUtils.createSuggestedQuestions()

  return (
    <div className="text-center py-8">
      <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Learning!</h3>
      <p className="text-gray-600 mb-4">
        Ask me anything about your document. I can help explain concepts, highlight important
        sections, and navigate to relevant pages.
      </p>
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

function MessageBubble({
  message,
  onPageClick,
}: {
  message: any
  onPageClick: (page: number) => void
}) {
  const isUser = message.role === 'user'
  const formattedTime = ChatUtils.formatTime(message.timestamp)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {message.metadata?.pageReference && (
            <button
              onClick={() => onPageClick(message.metadata.pageReference)}
              className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
            >
              Go to page {message.metadata.pageReference}
            </button>
          )}

          <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingMessage() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 max-w-[80%]">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 animate-spin" />
        </div>
        <div className="bg-gray-100 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">AI is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatInput({
  value,
  onChange,
  onSubmit,
  onKeyPress,
  isLoading,
  isRecording,
  onStartRecording,
  onStopRecording,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
}) {
  const textareaRows = ChatUtils.calculateTextareaRows(value)
  const canSubmit = ChatUtils.isValidMessageContent(value) && !isLoading && !isRecording

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-end gap-3">
        <Button
          variant={isRecording ? 'danger' : 'ghost'}
          size="sm"
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isLoading}
          className="flex-shrink-0"
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>

        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={isRecording ? 'Recording...' : 'Ask a question about the document...'}
            disabled={isLoading || isRecording}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            rows={textareaRows}
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        <p>{`Try asking: "Explain this concept on page 3" or "What are the key takeaways?`}</p>
      </div>
    </div>
  )
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatState.messages.length === 0 && (
          <SuggestedQuestions onQuestionClick={handleSendMessage} />
        )}

        {chatState.messages.map((message) => (
          <MessageBubble key={message.id} message={message} onPageClick={handlePageClick} />
        ))}

        {chatState.isLoading && <LoadingMessage />}

        {chatState.error && (
          <Alert variant="error" dismissible onDismiss={chatState.clearError}>
            {chatState.error}
          </Alert>
        )}

        <div ref={messageHandling.messagesEndRef} />
      </div>

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
