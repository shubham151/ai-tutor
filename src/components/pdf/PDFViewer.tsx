'use client'

import React, { useEffect, useRef } from 'react'
import { Annotation } from '../../types/pdf'
import { PDFToolbar } from './PDFToolbar'
import { PDFCanvas, PDFCanvasRef } from './PDFCanvas'
import { PDFLoadingState } from './PDFLoadingState'
import { PDFErrorState } from './PDFErrorState'
import { usePDFLoader } from '@/hooks/usePDFLoader'
import { usePDFRenderer } from '@/hooks/usePDFRenderer'
import { usePDFChatState } from '@/hooks/usePDFChatState'

interface PDFViewerProps {
  fileUrl: string
  annotations?: Annotation[]
  onAnnotationAdd?: (annotation: Omit<Annotation, 'id'>) => void
  onPageChange?: (page: number) => void
  pageToNavigate?: number | null
  className?: string
}

export function PDFViewer({
  fileUrl,
  annotations = [],
  onAnnotationAdd,
  onPageChange,
  pageToNavigate,
  className = '',
}: PDFViewerProps) {
  const { pdfDoc, isLoading, error, totalPages } = usePDFLoader(fileUrl)
  const { renderPage, cleanup } = usePDFRenderer()
  const { currentPage, scale, rotation, handlePageChange, handleZoom, handleRotate } =
    usePDFChatState()
  const canvasRef = useRef<PDFCanvasRef>(null)

  // Handle navigation from chat interface
  useEffect(() => {
    if (pageToNavigate && pageToNavigate !== currentPage && pageToNavigate <= totalPages) {
      handlePageChange(pageToNavigate, totalPages, onPageChange)
    }
  }, [pageToNavigate, currentPage, totalPages, handlePageChange, onPageChange])

  // Re-render page when state changes
  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      const canvas = canvasRef.current.getCanvas()

      if (canvas) {
        renderPage(pdfDoc, currentPage, canvas, scale, rotation)
          .then(() => {
            canvasRef.current?.syncCanvasDimensions()
            canvasRef.current?.renderAnnotations()
          })
          .catch((err) => console.error('Page rendering error:', err))
      }
    }
  }, [currentPage, scale, rotation, pdfDoc, renderPage])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  const handlePageChangeInternal = (newPage: number) => {
    handlePageChange(newPage, totalPages, onPageChange)
  }

  const handleDownload = () => {
    window.open(fileUrl, '_blank')
  }

  if (error) {
    return (
      <PDFErrorState error={error} onRetry={() => window.location.reload()} className={className} />
    )
  }

  return (
    <div className={`flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      <PDFToolbar
        currentPage={currentPage}
        totalPages={totalPages}
        scale={scale}
        onPageChange={handlePageChangeInternal}
        onZoom={handleZoom}
        onRotate={handleRotate}
        onDownload={handleDownload}
      />

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <PDFLoadingState />
        ) : (
          <PDFCanvas
            ref={canvasRef}
            annotations={annotations}
            currentPage={currentPage}
            onAnnotationAdd={onAnnotationAdd}
          />
        )}
      </div>
    </div>
  )
}

export default PDFViewer
