'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Loader2, Bot, User, Volume2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: {
    pageReference?: number
    annotations?: Array<{
      pageNumber: number
      x: number
      y: number
      width: number
      height: number
      type: string
    }>
  }
}

interface ChatInterfaceProps {
  documentId: string
  onAnnotationRequest?: (annotation: any) => void
  onPageNavigate?: (page: number) => void
  className?: string
}

const ChatInterface = ({
  documentId,
  onAnnotationRequest,
  onPageNavigate,
  className = '',
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load existing chat history
  useEffect(() => {
    loadChatHistory()
  }, [documentId])

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/${documentId}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.ok) {
        const { messages } = await response.json()
        setMessages(messages)
      }
    } catch (err) {
      console.error('Failed to load chat history:', err)
    }
  }

  const sendMessage = async (content: string, isVoice = false) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/chat/${documentId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          message: content,
          isVoice,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const { message: assistantMessage, annotations } = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantMessage.content,
          timestamp: new Date().toISOString(),
          metadata: {
            pageReference: assistantMessage.pageReference,
            annotations: annotations,
          },
        },
      ])

      // Handle annotations and page navigation
      if (annotations?.length > 0) {
        // If there are annotations, but no explicit pageReference, navigate to the first annotation's page.
        if (!assistantMessage.pageReference && annotations[0].pageNumber) {
          onPageNavigate?.(annotations[0].pageNumber)
        }
        annotations.forEach((annotation: any) => {
          onAnnotationRequest?.(annotation)
        })
      }

      if (assistantMessage.pageReference) {
        onPageNavigate?.(assistantMessage.pageReference)
      }

      // Text-to-speech for AI responses
      if ('speechSynthesis' in window && assistantMessage.content) {
        const utterance = new SpeechSynthesisUtterance(assistantMessage.content)
        utterance.rate = 0.9
        utterance.pitch = 1
        speechSynthesis.speak(utterance)
      }
    } catch (err) {
      setError('Failed to send message. Please try again.')
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.')
      console.error('Recording error:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsLoading(true)

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      })

      if (response.ok) {
        const { text } = await response.json()
        if (text) {
          await sendMessage(text, true)
        }
      } else {
        throw new Error('Transcription failed')
      }
    } catch (err) {
      setError('Failed to transcribe audio. Please try typing instead.')
      console.error('Transcription error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputSubmit = () => {
    sendMessage(inputValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleInputSubmit()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handlePageClick = (pageNumber: number) => {
    onPageNavigate?.(pageNumber)
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Learning!</h3>
            <p className="text-gray-600 mb-4">
              Ask me anything about your document. I can help explain concepts, highlight important
              sections, and navigate to relevant pages.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => sendMessage('What is this document about?')}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                What's this about?
              </button>
              <button
                onClick={() => sendMessage('Summarize the main points')}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
              >
                Summarize key points
              </button>
              <button
                onClick={() => sendMessage('Explain the most important concept')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
              >
                Key concepts
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Page Reference */}
                {message.metadata?.pageReference && (
                  <button
                    onClick={() => handlePageClick(message.metadata!.pageReference!)}
                    className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Go to page {message.metadata.pageReference}
                  </button>
                )}

                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
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
        )}

        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-end gap-3">
          {/* Voice Recording Button */}
          <Button
            variant={isRecording ? 'danger' : 'ghost'}
            size="sm"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? 'Recording...' : 'Ask a question about the document...'}
              disabled={isLoading || isRecording}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              rows={Math.min(Math.max(inputValue.split('\n').length, 1), 4)}
            />
          </div>

          {/* Send Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleInputSubmit}
            disabled={!inputValue.trim() || isLoading || isRecording}
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Tips */}
        <div className="mt-3 text-xs text-gray-500">
          <p>💡 Try asking: "Explain this concept on page 3" or "What are the key takeaways?"</p>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
