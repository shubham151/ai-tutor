// components/dashboard/UploadArea.tsx
'use client'

import React, { useState, useRef } from 'react'
import { Upload, FileText, Check, X } from 'lucide-react'
import Button from '@/components/ui/Button'

interface UploadAreaProps {
  onFileUpload: (files: FileList) => void
  isUploading?: boolean
  uploadProgress?: number
  className?: string
}

const UploadArea = ({
  onFileUpload,
  isUploading = false,
  uploadProgress = 0,
  className = '',
}: UploadAreaProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      handleFileSelection(files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files)
    }
  }

  const handleFileSelection = (files: FileList) => {
    const file = files[0]

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file')
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    onFileUpload(files)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const resetUpload = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
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
        `}
        onClick={!isUploading ? handleBrowseClick : undefined}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInputChange}
          className="hidden"
          id="file-upload"
        />

        {!isUploading ? (
          <>
            {/* Upload Icon */}
            <div
              className={`
              w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors
              ${isDragOver ? 'bg-blue-200' : 'bg-blue-100'}
            `}
            >
              <Upload className={`w-8 h-8 ${isDragOver ? 'text-blue-700' : 'text-blue-600'}`} />
            </div>

            {/* Upload Text */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragOver ? 'Drop your PDF here' : 'Upload a PDF Document'}
            </h3>
            <p className="text-gray-600 mb-6">
              Drag and drop your PDF here, or click to browse files
            </p>

            {/* Upload Button */}
            <Button
              variant="primary"
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={handleBrowseClick}
              className="mx-auto"
            >
              Choose PDF File
            </Button>

            {/* File Requirements */}
            <div className="mt-6 text-sm text-gray-500">
              <p>Supported: PDF files up to 10MB</p>
            </div>
          </>
        ) : (
          <>
            {/* Upload Progress */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {uploadProgress === 100 ? (
                <Check className="w-8 h-8 text-green-600" />
              ) : (
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {uploadProgress === 100 ? 'Upload Complete!' : 'Uploading...'}
            </h3>

            {selectedFile && (
              <p className="text-gray-600 mb-4">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}

            {/* Progress Bar */}
            <div className="w-full max-w-xs mx-auto mb-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
            </div>

            {uploadProgress < 100 && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X className="w-4 h-4" />}
                onClick={resetUpload}
              >
                Cancel
              </Button>
            )}
          </>
        )}
      </div>

      {/* Quick Tips */}
      {!isUploading && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload textbooks, research papers, or study materials</li>
            <li>• Clear, high-quality PDFs work best with our AI</li>
            <li>• Try asking questions about specific sections or concepts</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default UploadArea
