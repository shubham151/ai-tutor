'use client'

import React, { useRef } from 'react'
import { DocumentCard } from './DocumentCard'
import { EmptyState } from './EmptyState'
import { LoadingGrid } from './LoadingGrid'

interface Document {
  id: string
  filename: string
  originalName: string
  fileUrl: string
  pageCount: number
  createdAt: string
  lastAccessed?: string
}

interface DocumentGridProps {
  documents: Document[]
  isLoading?: boolean
  onDocumentClick: (document: Document) => void
  onDocumentDelete: (documentId: string) => void
  onFileUpload: (file: File) => void
  className?: string
}

export function DocumentGrid({
  documents,
  isLoading = false,
  onDocumentClick,
  onDocumentDelete,
  onFileUpload,
  className = '',
}: DocumentGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      onFileUpload(file)
    }
    e.target.value = ''
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <DocumentGridHeader documentCount={0} />
        <LoadingGrid />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <DocumentGridHeader documentCount={documents.length} />

      {documents.length === 0 ? (
        <EmptyState onUploadClick={triggerFileSelect} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onDocumentClick={onDocumentClick}
              onDocumentDelete={onDocumentDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface DocumentGridHeaderProps {
  documentCount: number
}

function DocumentGridHeader({ documentCount }: DocumentGridHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900">
        Your Documents {documentCount > 0 && `(${documentCount})`}
      </h2>

      {documentCount > 0 && (
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
          <option>Recently uploaded</option>
          <option>Alphabetical</option>
          <option>Most accessed</option>
        </select>
      )}
    </div>
  )
}
