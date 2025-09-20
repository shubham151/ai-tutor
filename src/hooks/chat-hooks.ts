// hooks/chat-hooks.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import ChatService from '@/core/ChatService'
import VoiceService from '@/core/VoiceService'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  metadata?: {
    pageReference?: number
    annotations?: any[]
  }
}

interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string
  inputValue: string
}

function createInitialChatState(): ChatState {
  return {
    messages: [],
    isLoading: false,
    error: '',
    inputValue: '',
  }
}

export function useChatState() {
  const [state, setState] = useState(createInitialChatState())

  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const addMessage = useCallback((message: Message) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }))
  }, [])

  const setMessages = useCallback((messages: Message[]) => {
    setState((prev) => ({ ...prev, messages }))
  }, [])

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }))
  }, [])

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error }))
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: '' }))
  }, [])

  const setInput = useCallback((inputValue: string) => {
    setState((prev) => ({ ...prev, inputValue }))
  }, [])

  const clearInput = useCallback(() => {
    setState((prev) => ({ ...prev, inputValue: '' }))
  }, [])

  return {
    ...state,
    updateState,
    addMessage,
    setMessages,
    setLoading,
    setError,
    clearError,
    setInput,
    clearInput,
  }
}

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.start()
      setIsRecording(true)
      return true
    } catch (error) {
      console.error('Recording error:', error)
      return false
    }
  }, [])

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null)
        return
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const tracks = mediaRecorderRef.current?.stream?.getTracks()
        tracks?.forEach((track) => track.stop())
        setIsRecording(false)
        resolve(audioBlob)
      }

      mediaRecorderRef.current.stop()
    })
  }, [isRecording])

  return {
    isRecording,
    startRecording,
    stopRecording,
  }
}

export function useChatOperations(documentId: string) {
  const loadChatHistory = useCallback(async (): Promise<Message[]> => {
    return await ChatService.getChatHistory(documentId)
  }, [documentId])

  const sendMessage = useCallback(
    async (content: string, isVoice = false) => {
      return await ChatService.sendMessage(documentId, content, isVoice)
    },
    [documentId]
  )

  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string> => {
    return await VoiceService.transcribe(audioBlob)
  }, [])

  return {
    loadChatHistory,
    sendMessage,
    transcribeAudio,
  }
}

export function useMessageHandling() {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const speakMessage = useCallback((content: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.rate = 0.9
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }, [])

  const createUserMessage = useCallback((content: string): Message => {
    return {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }
  }, [])

  const createAssistantMessage = useCallback((response: any): Message => {
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.message.content,
      createdAt: new Date().toISOString(),
      metadata: {
        pageReference: response.message.pageReference,
        annotations: response.annotations,
      },
    }
  }, [])

  return {
    messagesEndRef,
    scrollToBottom,
    speakMessage,
    createUserMessage,
    createAssistantMessage,
  }
}
