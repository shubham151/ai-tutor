import React from 'react'
import { FileText } from 'lucide-react'
import Button from '@/components/ui/Button'

interface EmptyStateProps {
  onUploadClick: () => void
}

export function EmptyState({ onUploadClick }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
      <p className="text-gray-600 mb-6">
        Upload your first PDF to start learning with our AI tutor
      </p>
      <Button variant="primary" leftIcon={<FileText className="w-4 h-4" />} onClick={onUploadClick}>
        Upload PDF
      </Button>
    </div>
  )
}
