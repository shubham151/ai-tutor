import React from 'react'

interface PDFLoadingStateProps {
  message?: string
}

export function PDFLoadingState({ message = 'Loading PDF...' }: PDFLoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}
