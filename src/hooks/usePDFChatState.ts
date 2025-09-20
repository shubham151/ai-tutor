import { useState, useCallback, useMemo } from 'react'
import { Document, Annotation, ViewState, PDFViewerState, PDFChatState } from '@/types/pdfChat'

interface PDFChatStateReturn extends PDFChatState {
  setDocument: (document: Document) => void
  setAnnotations: (annotations: Annotation[]) => void
  addAnnotation: (annotation: Annotation) => void
  setCurrentPage: (page: number) => void
  setPageToNavigate: (page: number | null) => void
  togglePDFFullscreen: () => void
  toggleChatFullscreen: () => void
  clearPageNavigation: () => void
  handlePageChange: (
    page: number,
    totalPages?: number,
    onPageChange?: (page: number) => void
  ) => void
  handleZoom: (delta: number) => void
  handleRotate: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string) => void
  clearError: () => void
  currentPage: number
  scale: number
  rotation: number
}

export function usePDFChatState(): PDFChatStateReturn {
  const [state, setState] = useState<PDFChatState>({
    document: null,
    annotations: [],
    viewState: {
      isFullScreenPDF: false,
      isFullScreenChat: false,
      currentPage: 1,
      pageToNavigate: null,
    },
    pdfViewerState: {
      scale: 1.0,
      rotation: 0,
    },
    isLoading: true,
    error: '',
  })

  // Memoize all actions with stable references
  const actions = useMemo(() => {
    const setDocument = (document: Document) => {
      setState((prev) => ({ ...prev, document }))
    }

    const setAnnotations = (annotations: Annotation[]) => {
      setState((prev) => ({ ...prev, annotations }))
    }

    const addAnnotation = (annotation: Annotation) => {
      setState((prev) => ({
        ...prev,
        annotations: [...prev.annotations, annotation],
      }))
    }

    const setCurrentPage = (page: number) => {
      setState((prev) => ({
        ...prev,
        viewState: { ...prev.viewState, currentPage: page },
      }))
    }

    const setPageToNavigate = (page: number | null) => {
      setState((prev) => ({
        ...prev,
        viewState: {
          ...prev.viewState,
          pageToNavigate: page,
          currentPage: page || prev.viewState.currentPage,
        },
      }))
    }

    const togglePDFFullscreen = () => {
      setState((prev) => ({
        ...prev,
        viewState: {
          ...prev.viewState,
          isFullScreenPDF: !prev.viewState.isFullScreenPDF,
        },
      }))
    }

    const toggleChatFullscreen = () => {
      setState((prev) => ({
        ...prev,
        viewState: {
          ...prev.viewState,
          isFullScreenChat: !prev.viewState.isFullScreenChat,
        },
      }))
    }

    const clearPageNavigation = () => {
      setState((prev) => ({
        ...prev,
        viewState: { ...prev.viewState, pageToNavigate: null },
      }))
    }

    const handlePageChange = (
      page: number,
      totalPages?: number,
      onPageChange?: (page: number) => void
    ) => {
      if (!totalPages || (page >= 1 && page <= totalPages)) {
        setCurrentPage(page)
        onPageChange?.(page)
      }
    }

    const handleZoom = (delta: number) => {
      setState((prev) => ({
        ...prev,
        pdfViewerState: {
          ...prev.pdfViewerState,
          scale: Math.max(0.5, Math.min(3.0, prev.pdfViewerState.scale + delta)),
        },
      }))
    }

    const handleRotate = () => {
      setState((prev) => ({
        ...prev,
        pdfViewerState: {
          ...prev.pdfViewerState,
          rotation: (prev.pdfViewerState.rotation + 90) % 360,
        },
      }))
    }

    const setLoading = (isLoading: boolean) => {
      setState((prev) => ({ ...prev, isLoading }))
    }

    const setError = (error: string) => {
      setState((prev) => ({ ...prev, error }))
    }

    const clearError = () => {
      setState((prev) => ({ ...prev, error: '' }))
    }

    return {
      setDocument,
      setAnnotations,
      addAnnotation,
      setCurrentPage,
      setPageToNavigate,
      togglePDFFullscreen,
      toggleChatFullscreen,
      clearPageNavigation,
      handlePageChange,
      handleZoom,
      handleRotate,
      setLoading,
      setError,
      clearError,
    }
  }, []) // Empty dependency array - functions are stable

  // Return stable object
  return useMemo(
    () => ({
      ...state,
      currentPage: state.viewState.currentPage,
      scale: state.pdfViewerState.scale,
      rotation: state.pdfViewerState.rotation,
      ...actions,
    }),
    [state, actions]
  )
}
