'use client'

import React, { useState, useRef } from 'react'
import { DragDropZone } from './DragDropZone'
import { UploadProgress } from './UploadProgress'
import { UploadPrompt } from './UploadPrompt'
import { UploadTips } from './UploadTips'
import { FileValidator } from './FileValidator'

interface UploadAreaProps {
  onFileUpload: (files: FileList) => void
  isUploading?: boolean
  uploadProgress?: number
  className?: string
}

export function UploadArea({
  onFileUpload,
  isUploading = false,
  uploadProgress = 0,
  className = '',
}: UploadAreaProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelection = (files: FileList) => {
    const file = files[0]
    const validation = FileValidator.validateFile(file)

    if (!validation.isValid) {
      alert(validation.error)
      return
    }

    setSelectedFile(file)
    onFileUpload(files)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileInputChange}
        className="hidden"
        id="file-upload"
      />

      <DragDropZone onFileSelect={handleFileSelection} isUploading={isUploading}>
        {isUploading ? (
          <UploadProgress file={selectedFile} progress={uploadProgress} onCancel={resetUpload} />
        ) : (
          <UploadPrompt onBrowseClick={handleBrowseClick} />
        )}
      </DragDropZone>

      {!isUploading && <UploadTips />}
    </div>
  )
}
