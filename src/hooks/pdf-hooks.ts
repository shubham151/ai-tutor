// hooks/pdf-hooks.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import PDFService from '@/core/PDFService'

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

interface PDFState {
  currentPage: number
  totalPages: number
  scale: number
  rotation: number
  isLoading: boolean
  error: string
}

function createInitialPDFState(): PDFState {
  return {
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,
    rotation: 0,
    isLoading: true,
    error: '',
  }
}

export function usePDFState() {
  const [state, setState] = useState(createInitialPDFState())

  const updateState = useCallback((updates: Partial<PDFState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const setCurrentPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }))
  }, [])

  const setTotalPages = useCallback((pages: number) => {
    setState((prev) => ({ ...prev, totalPages: pages }))
  }, [])

  const setScale = useCallback((scale: number) => {
    setState((prev) => ({ ...prev, scale }))
  }, [])

  const setRotation = useCallback((rotation: number) => {
    setState((prev) => ({ ...prev, rotation }))
  }, [])

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }))
  }, [])

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error }))
  }, [])

  return {
    ...state,
    updateState,
    setCurrentPage,
    setTotalPages,
    setScale,
    setRotation,
    setLoading,
    setError,
  }
}

export function usePDFRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfDocRef = useRef<any>(null)

  const loadPDF = useCallback(async (fileUrl: string) => {
    return await PDFService.loadDocument(fileUrl)
  }, [])

  const renderPage = useCallback(
    async (pageNum: number, scale: number, rotation: number, annotations: Annotation[] = []) => {
      if (!canvasRef.current || !pdfDocRef.current) return

      await PDFService.renderPage(
        pdfDocRef.current,
        pageNum,
        canvasRef.current,
        scale,
        rotation,
        annotations
      )
    },
    []
  )

  const setPDFDocument = useCallback((pdfDoc: any) => {
    pdfDocRef.current = pdfDoc
  }, [])

  return {
    canvasRef,
    loadPDF,
    renderPage,
    setPDFDocument,
  }
}

export function usePDFControls() {
  const handlePageChange = useCallback((currentPage: number, totalPages: number, delta: number) => {
    const newPage = currentPage + delta
    if (newPage >= 1 && newPage <= totalPages) {
      return newPage
    }
    return currentPage
  }, [])

  const handleZoom = useCallback((currentScale: number, delta: number) => {
    return Math.max(0.5, Math.min(3.0, currentScale + delta))
  }, [])

  const handleRotate = useCallback((currentRotation: number) => {
    return (currentRotation + 90) % 360
  }, [])

  const createAnnotationFromClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>, currentPage: number) => {
      const canvas = event.currentTarget
      const rect = canvas.getBoundingClientRect()
      const x = (event.clientX - rect.left) / canvas.width
      const y = 1 - (event.clientY - rect.top) / canvas.height

      return {
        pageNumber: currentPage,
        x: x - 0.05,
        y: y + 0.02,
        width: 0.1,
        height: 0.04,
        type: 'highlight' as const,
        color: '#ffff00',
      }
    },
    []
  )

  return {
    handlePageChange,
    handleZoom,
    handleRotate,
    createAnnotationFromClick,
  }
}

export function usePDFNavigation(
  currentPage: number,
  pageToNavigate: number = 1,
  onPageChange: (page: number) => void
) {
  useEffect(() => {
    if (pageToNavigate && pageToNavigate !== currentPage) {
      onPageChange(pageToNavigate)
    }
  }, [pageToNavigate, currentPage, onPageChange])
}
