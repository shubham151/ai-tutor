'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'
import Button from '@/components/ui/Button'

// Import PDF.js at module level instead of dynamic import
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'

// Set worker source immediately
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
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

interface PDFViewerProps {
  fileUrl: string
  annotations?: Annotation[]
  onAnnotationAdd?: (annotation: Omit<Annotation, 'id'>) => void
  onPageChange?: (page: number) => void
  pageToNavigate?: number | null
  className?: string
}

const PDFViewer = ({
  fileUrl,
  annotations = [],
  onAnnotationAdd,
  onPageChange,
  pageToNavigate,
  className = '',
}: PDFViewerProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pdfDocRef = useRef<any>(null)

  // Initialize PDF.js
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true)
        setError('')

        console.log('Loading PDF from:', fileUrl)

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: '//cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        })

        const pdf = await loadingTask.promise
        pdfDocRef.current = pdf
        setTotalPages(pdf.numPages)

        console.log('PDF loaded successfully. Pages:', pdf.numPages)

        await renderPage(1, pdf)
        setIsLoading(false)
      } catch (err: any) {
        console.error('PDF loading error:', err)

        // More specific error messages
        let errorMessage = 'Failed to load PDF. Please try again.'
        if (err.name === 'InvalidPDFException') {
          errorMessage = 'Invalid PDF file format.'
        } else if (err.name === 'MissingPDFException') {
          errorMessage = 'PDF file not found.'
        } else if (err.name === 'UnexpectedResponseException') {
          errorMessage = 'Unable to access PDF file. Please check your connection.'
        }

        setError(errorMessage)
        setIsLoading(false)
      }
    }

    if (fileUrl) {
      loadPDF()
    }
  }, [fileUrl])

  // Effect to handle navigation from the chat interface
  useEffect(() => {
    if (pageToNavigate && pageToNavigate !== currentPage && pageToNavigate <= totalPages) {
      handlePageChange(pageToNavigate)
    }
  }, [pageToNavigate, currentPage, totalPages])

  // Effect to re-render the current page when annotations or current page change
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(currentPage)
    }
  }, [annotations, currentPage])

  const renderPage = async (pageNum: number, pdfDoc?: any) => {
    if (!canvasRef.current) return

    const pdf = pdfDoc || pdfDocRef.current
    if (!pdf) return

    try {
      const page = await pdf.getPage(pageNum)
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (!context) return

      const viewport = page.getViewport({
        scale: scale,
        rotation: rotation,
      })

      // Set canvas dimensions
      canvas.height = viewport.height
      canvas.width = viewport.width

      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height)

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise

      // Render annotations for current page
      renderAnnotations(pageNum, context, viewport)
    } catch (err) {
      console.error('Page rendering error:', err)
      setError('Failed to render page')
    }
  }

  const renderAnnotations = (pageNum: number, context: CanvasRenderingContext2D, viewport: any) => {
    const pageAnnotations = annotations.filter((ann) => ann.pageNumber === pageNum)

    pageAnnotations.forEach((annotation) => {
      context.save()

      // Convert PDF coordinates to canvas coordinates
      const x = annotation.x * viewport.width
      const y = (1 - annotation.y) * viewport.height // PDF coordinates are bottom-up
      const width = annotation.width * viewport.width
      const height = annotation.height * viewport.height

      context.strokeStyle = annotation.color || '#ff0000'
      context.lineWidth = 2
      context.fillStyle = annotation.color ? `${annotation.color}40` : '#ff000040'

      switch (annotation.type) {
        case 'highlight':
          context.fillRect(x, y - height, width, height)
          break
        case 'circle':
          context.beginPath()
          context.ellipse(x + width / 2, y - height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI)
          context.stroke()
          break
        case 'arrow':
          // Simple arrow implementation
          context.beginPath()
          context.moveTo(x, y)
          context.lineTo(x + width, y - height)
          context.stroke()
          break
      }

      context.restore()
    })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      onPageChange?.(newPage)
    }
  }

  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3.0, scale + delta))
    setScale(newScale)
  }

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360
    setRotation(newRotation)
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onAnnotationAdd || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) / canvas.width
    const y = 1 - (event.clientY - rect.top) / canvas.height // Convert to PDF coordinates

    // Create a highlight annotation at click position
    const annotation: Omit<Annotation, 'id'> = {
      pageNumber: currentPage,
      x: x - 0.05,
      y: y + 0.02,
      width: 0.1,
      height: 0.04,
      type: 'highlight',
      color: '#ffff00',
    }

    onAnnotationAdd(annotation)
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center h-full bg-gray-100 rounded-lg ${className}`}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm text-gray-600 mx-2">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(-0.2)}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <span className="text-sm text-gray-600 mx-2">{Math.round(scale * 100)}%</span>

          <Button variant="ghost" size="sm" onClick={() => handleZoom(0.2)} disabled={scale >= 3.0}>
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={handleRotate}>
            <RotateCw className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={() => window.open(fileUrl, '_blank')}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas Container */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="shadow-lg cursor-crosshair border border-gray-300 rounded"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFViewer
