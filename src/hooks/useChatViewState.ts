import { useState, useCallback } from 'react'

interface Document {
  id: string
  filename: string
  originalName: string
  fileUrl: string
  pageCount: number
  createdAt: string
}

interface Annotation {
  id: string
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  type: 'highlight' | 'circle' | 'arrow'
  color: string
  text?: string
}

interface ChatViewState {
  document: Document | null
  annotations: Annotation[]
  currentPage: number
  isFullScreenPDF: boolean
  isFullScreenChat: boolean
  isLoading: boolean
  error: string
  pageToNavigate: number | null
}

export function useChatViewState() {
  const [state, setState] = useState<ChatViewState>({
    document: null,
    annotations: [],
    currentPage: 1,
    isFullScreenPDF: false,
    isFullScreenChat: false,
    isLoading: true,
    error: '',
    pageToNavigate: null,
  })

  const updateState = useCallback((updates: Partial<ChatViewState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const setDocument = useCallback(
    (document: Document) => {
      updateState({ document })
    },
    [updateState]
  )

  const setAnnotations = useCallback(
    (annotations: Annotation[]) => {
      updateState({ annotations })
    },
    [updateState]
  )

  const addAnnotation = useCallback((annotation: Annotation) => {
    setState((prev) => ({
      ...prev,
      annotations: [...prev.annotations, annotation],
    }))
  }, [])

  const setCurrentPage = useCallback(
    (page: number) => {
      updateState({ currentPage: page })
    },
    [updateState]
  )

  const setPageToNavigate = useCallback(
    (page: number | null) => {
      updateState({ pageToNavigate: page, currentPage: page || state.currentPage })
    },
    [updateState, state.currentPage]
  )

  const togglePDFFullscreen = useCallback(() => {
    updateState({ isFullScreenPDF: !state.isFullScreenPDF })
  }, [updateState, state.isFullScreenPDF])

  const toggleChatFullscreen = useCallback(() => {
    updateState({ isFullScreenChat: !state.isFullScreenChat })
  }, [updateState, state.isFullScreenChat])

  const setLoading = useCallback(
    (isLoading: boolean) => {
      updateState({ isLoading })
    },
    [updateState]
  )

  const setError = useCallback(
    (error: string) => {
      updateState({ error })
    },
    [updateState]
  )

  const clearPageNavigation = useCallback(() => {
    updateState({ pageToNavigate: null })
  }, [updateState])

  return {
    ...state,
    setDocument,
    setAnnotations,
    addAnnotation,
    setCurrentPage,
    setPageToNavigate,
    togglePDFFullscreen,
    toggleChatFullscreen,
    setLoading,
    setError,
    clearPageNavigation,
  }
}
