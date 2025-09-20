import React from 'react'

interface UploadTipsProps {
  className?: string
}

export function UploadTips({ className = '' }: UploadTipsProps) {
  const tips = [
    'Upload textbooks, research papers, or study materials',
    'Clear, high-quality PDFs work best with our AI',
    'Try asking questions about specific sections or concepts',
  ]

  return (
    <div className={`bg-blue-50 rounded-lg p-4 border border-blue-100 ${className}`}>
      <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h4>
      <ul className="text-sm text-blue-800 space-y-1">
        {tips.map((tip, index) => (
          <li key={index}>• {tip}</li>
        ))}
      </ul>
    </div>
  )
}
