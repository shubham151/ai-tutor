import React from 'react'
import { Upload, FileText } from 'lucide-react'
import Button from '@/components/ui/Button'

interface UploadPromptProps {
  onBrowseClick: () => void
}

export function UploadPrompt({ onBrowseClick }: UploadPromptProps) {
  return (
    <>
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Upload className="w-8 h-8 text-blue-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload a PDF Document</h3>
      <p className="text-gray-600 mb-6">Drag and drop your PDF here, or click to browse files</p>

      <Button
        variant="primary"
        leftIcon={<FileText className="w-4 h-4" />}
        onClick={onBrowseClick}
        className="mx-auto"
      >
        Choose PDF File
      </Button>

      <div className="mt-6 text-sm text-gray-500">
        <p>Supported: PDF files up to 10MB</p>
      </div>
    </>
  )
}
