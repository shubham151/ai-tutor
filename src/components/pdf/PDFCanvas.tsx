import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Annotation } from '@/types/pdf'
import { AnnotationRenderer } from './AnnotationRenderer'
import { PDFUtils } from '@/utils/PdfUtils'

interface PDFCanvasProps {
  annotations: Annotation[]
  currentPage: number
  onAnnotationAdd?: (annotation: Omit<Annotation, 'id'>) => void
  className?: string
}

export interface PDFCanvasRef {
  getCanvas: () => HTMLCanvasElement | null
  getAnnotationCanvas: () => HTMLCanvasElement | null
  renderAnnotations: () => void
  syncCanvasDimensions: () => void
}

export const PDFCanvas = forwardRef<PDFCanvasRef, PDFCanvasProps>(
  ({ annotations, currentPage, onAnnotationAdd, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const annotationCanvasRef = useRef<HTMLCanvasElement>(null)

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      getAnnotationCanvas: () => annotationCanvasRef.current,
      renderAnnotations: () => renderAnnotations(),
      syncCanvasDimensions: () => syncCanvasDimensions(),
    }))

    const syncCanvasDimensions = () => {
      const canvas = canvasRef.current
      const annotationCanvas = annotationCanvasRef.current

      if (canvas && annotationCanvas) {
        annotationCanvas.width = canvas.width
        annotationCanvas.height = canvas.height
      }
    }

    const renderAnnotations = () => {
      const annotationCanvas = annotationCanvasRef.current
      if (!annotationCanvas) return

      const context = annotationCanvas.getContext('2d')
      if (!context) return

      AnnotationRenderer.render({
        annotations,
        currentPage,
        canvasWidth: annotationCanvas.width,
        canvasHeight: annotationCanvas.height,
        context,
      })
    }

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onAnnotationAdd || !annotationCanvasRef.current) return

      const canvas = annotationCanvasRef.current
      const rect = canvas.getBoundingClientRect()

      const normalizedCoords = PDFUtils.convertToNormalizedCoordinates(
        {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
        rect.width,
        rect.height
      )

      const annotation: Omit<Annotation, 'id'> = {
        pageNumber: currentPage,
        x: Math.max(0, normalizedCoords.x - 0.05),
        y: Math.max(0, normalizedCoords.y - 0.02),
        width: 0.1,
        height: 0.04,
        type: 'highlight',
        color: '#ffff00',
        text: 'Manual highlight',
      }

      onAnnotationAdd(annotation)
    }

    // Re-render annotations when they change
    useEffect(() => {
      renderAnnotations()
    }, [annotations, currentPage])

    return (
      <div className={`flex justify-center relative ${className}`}>
        <canvas
          ref={canvasRef}
          className="shadow-lg border border-gray-300 rounded absolute"
          style={{ maxWidth: '100%', height: 'auto', zIndex: 1 }}
        />
        <canvas
          ref={annotationCanvasRef}
          onClick={handleCanvasClick}
          className="shadow-lg cursor-crosshair border border-gray-300 rounded relative"
          style={{ maxWidth: '100%', height: 'auto', zIndex: 2 }}
        />
      </div>
    )
  }
)

PDFCanvas.displayName = 'PDFCanvas'
