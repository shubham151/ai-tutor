import React from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'
import Button from '@/components/ui/Button'

interface PDFToolbarProps {
  currentPage: number
  totalPages: number
  scale: number
  onPageChange: (page: number) => void
  onZoom: (delta: number) => void
  onRotate: () => void
  onDownload: () => void
}

export function PDFToolbar({
  currentPage,
  totalPages,
  scale,
  onPageChange,
  onZoom,
  onRotate,
  onDownload,
}: PDFToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <PageNavigation
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <ViewingControls scale={scale} onZoom={onZoom} onRotate={onRotate} onDownload={onDownload} />
    </div>
  )
}

interface PageNavigationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function PageNavigation({ currentPage, totalPages, onPageChange }: PageNavigationProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
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
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}

interface ViewingControlsProps {
  scale: number
  onZoom: (delta: number) => void
  onRotate: () => void
  onDownload: () => void
}

function ViewingControls({ scale, onZoom, onRotate, onDownload }: ViewingControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => onZoom(-0.2)} disabled={scale <= 0.5}>
        <ZoomOut className="w-4 h-4" />
      </Button>

      <span className="text-sm text-gray-600 mx-2">{Math.round(scale * 100)}%</span>

      <Button variant="ghost" size="sm" onClick={() => onZoom(0.2)} disabled={scale >= 3.0}>
        <ZoomIn className="w-4 h-4" />
      </Button>

      <Button variant="ghost" size="sm" onClick={onRotate}>
        <RotateCw className="w-4 h-4" />
      </Button>

      <Button variant="ghost" size="sm" onClick={onDownload}>
        <Download className="w-4 h-4" />
      </Button>
    </div>
  )
}
