import React from 'react'
import { Check, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { FileValidator } from './FileValidator'

interface UploadProgressProps {
  file: File | null
  progress: number
  onCancel: () => void
}

export function UploadProgress({ file, progress, onCancel }: UploadProgressProps) {
  const isComplete = progress === 100

  return (
    <>
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {isComplete ? (
          <Check className="w-8 h-8 text-green-600" />
        ) : (
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {isComplete ? 'Upload Complete!' : 'Uploading...'}
      </h3>

      {file && (
        <p className="text-gray-600 mb-4">
          {file.name} ({FileValidator.formatFileSize(file.size)})
        </p>
      )}

      <div className="w-full max-w-xs mx-auto mb-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">{progress}%</p>
      </div>

      {!isComplete && (
        <Button variant="ghost" size="sm" leftIcon={<X className="w-4 h-4" />} onClick={onCancel}>
          Cancel
        </Button>
      )}
    </>
  )
}
