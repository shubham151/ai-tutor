import React from 'react'
import Button from '@/components/ui/Button'

interface PDFErrorStateProps {
  error: string
  onRetry?: () => void
  className?: string
}

export function PDFErrorState({ error, onRetry, className = '' }: PDFErrorStateProps) {
  return (
    <div className={`flex items-center justify-center h-full bg-gray-100 rounded-lg ${className}`}>
      <div className="text-center">
        <p className="text-red-600 mb-4">{error}</p>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}
