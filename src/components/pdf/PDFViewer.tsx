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
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pdfDocRef = useRef<any>(null)
  const renderTaskRef = useRef<any>(null)

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

  // Effect to re-render when annotations change
  useEffect(() => {
    if (pdfDocRef.current && !isLoading) {
      renderAnnotations()
    }
  }, [annotations, currentPage, scale, rotation])

  // Effect to re-render the current page when state changes
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(currentPage)
    }
  }, [currentPage, scale, rotation])

  const renderPage = async (pageNum: number, pdfDoc?: any) => {
    if (!canvasRef.current || !annotationCanvasRef.current) return

    const pdf = pdfDoc || pdfDocRef.current
    if (!pdf) return

    // Cancel previous render if it's still running
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
    }

    try {
      const page = await pdf.getPage(pageNum)
      const canvas = canvasRef.current
      const annotationCanvas = annotationCanvasRef.current
      const context = canvas.getContext('2d')

      if (!context) return

      const viewport = page.getViewport({
        scale: scale,
        rotation: rotation,
      })

      // Set canvas dimensions for both canvases
      canvas.height = viewport.height
      canvas.width = viewport.width
      annotationCanvas.height = viewport.height
      annotationCanvas.width = viewport.width

      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height)

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      // Store the render task
      renderTaskRef.current = page.render(renderContext)
      await renderTaskRef.current.promise

      // Reset the render task ref after completion
      renderTaskRef.current = null

      // Render annotations after page is rendered
      renderAnnotations()
    } catch (err: any) {
      // Ignore errors from cancelled renders
      if (err.name === 'RenderingCancelledException') {
        console.log('Rendering was cancelled.')
        return
      }

      console.error('Page rendering error:', err)
      setError('Failed to render page')
    }
  }

  const renderAnnotations = () => {
    if (!annotationCanvasRef.current || !canvasRef.current) return

    const annotationCanvas = annotationCanvasRef.current
    const context = annotationCanvas.getContext('2d')
    if (!context) return

    // Clear annotation canvas
    context.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height)

    // Filter annotations for current page
    const pageAnnotations = annotations.filter((ann) => ann.pageNumber === currentPage)

    console.log(`Rendering ${pageAnnotations.length} annotations for page ${currentPage}`)

    pageAnnotations.forEach((annotation) => {
      context.save()

      // Convert normalized coordinates (0-1) to canvas coordinates
      const canvasWidth = annotationCanvas.width
      const canvasHeight = annotationCanvas.height

      const x = annotation.x * canvasWidth
      const y = annotation.y * canvasHeight
      const width = annotation.width * canvasWidth
      const height = annotation.height * canvasHeight

      console.log('Rendering annotation:', {
        type: annotation.type,
        x,
        y,
        width,
        height,
        color: annotation.color,
      })

      context.strokeStyle = annotation.color || '#ff0000'
      context.lineWidth = 2
      context.fillStyle = annotation.color ? `${annotation.color}66` : '#ff000066' // Semi-transparent

      switch (annotation.type) {
        case 'highlight':
          context.fillRect(x, y, width, height)
          context.strokeRect(x, y, width, height)
          break
        case 'circle':
          context.beginPath()
          context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI)
          context.fill()
          context.stroke()
          break
        case 'arrow':
          context.beginPath()
          context.moveTo(x, y + height)
          context.lineTo(x + width, y)
          context.lineTo(x + width * 0.8, y + height * 0.2)
          context.moveTo(x + width, y)
          context.lineTo(x + width * 0.8, y - height * 0.2)
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
    if (!onAnnotationAdd || !annotationCanvasRef.current) return

    const canvas = annotationCanvasRef.current
    const rect = canvas.getBoundingClientRect()

    // Calculate normalized coordinates (0-1)
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    console.log('Canvas click at normalized coords:', { x, y })

    // Create a highlight annotation at click position
    const annotation: Omit<Annotation, 'id'> = {
      pageNumber: currentPage,
      x: Math.max(0, x - 0.05), // Center the highlight around click
      y: Math.max(0, y - 0.02),
      width: 0.1,
      height: 0.04,
      type: 'highlight',
      color: '#ffff00',
      text: 'Manual highlight',
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
          <div className="flex justify-center relative">
            {/* PDF Canvas */}
            <canvas
              ref={canvasRef}
              className="shadow-lg border border-gray-300 rounded absolute"
              style={{ maxWidth: '100%', height: 'auto', zIndex: 1 }}
            />
            {/* Annotation Canvas (overlay) */}
            <canvas
              ref={annotationCanvasRef}
              onClick={handleCanvasClick}
              className="shadow-lg cursor-crosshair border border-gray-300 rounded relative"
              style={{ maxWidth: '100%', height: 'auto', zIndex: 2 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFViewer
