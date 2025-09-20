'use client'

import React, { useState } from 'react'
import { Upload } from 'lucide-react'

interface DragDropZoneProps {
  onFileSelect: (files: FileList) => void
  isUploading: boolean
  children: React.ReactNode
  className?: string
}

export function DragDropZone({
  onFileSelect,
  isUploading,
  children,
  className = '',
}: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileSelect(files)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative bg-white rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 cursor-pointer
        ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }
        ${isUploading ? 'pointer-events-none' : ''}
        ${className}
      `}
    >
      {children}
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-2xl">
          <div className="text-center">
            <Upload className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <p className="text-lg font-semibold text-blue-900">Drop your PDF here</p>
          </div>
        </div>
      )}
    </div>
  )
}
