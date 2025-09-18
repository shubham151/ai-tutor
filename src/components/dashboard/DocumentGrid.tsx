// components/dashboard/DocumentGrid.tsx
'use client'

import React, { useState } from 'react'
import { FileText, MessageSquare, MoreVertical, Trash2, Download, Eye, Clock } from 'lucide-react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
  className?: string
}

interface DocumentCardProps {
  document: Document
  onDocumentClick: (document: Document) => void
  onDocumentDelete: (documentId: string) => void
}

const DocumentCard = ({ document, onDocumentClick, onDocumentDelete }: DocumentCardProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const truncateFileName = (name: string, maxLength: number = 30): string => {
    if (name.length <= maxLength) return name
    const extension = name.split('.').pop()
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'))
    const truncated = nameWithoutExt.substring(0, maxLength - extension!.length - 4)
    return `${truncated}...${extension}`
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    setIsDeleting(true)
    try {
      await onDocumentDelete(document.id)
    } finally {
      setIsDeleting(false)
      setShowMenu(false)
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)

    try {
      const response = await fetch(document.fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = document.originalName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <div
      className="relative group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onDocumentClick(document)}
    >
      {/* Document Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-red-600" />
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  onDocumentClick(document)
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                Open & Chat
              </button>

              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              <hr className="my-1 border-gray-100" />

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {isDeleting ? (
                  <LoadingSpinner size="sm" color="red" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Document Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 leading-tight">
          {truncateFileName(document.originalName)}
        </h3>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{document.pageCount} pages</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(document.createdAt)}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<MessageSquare className="w-4 h-4" />}
          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          onClick={(e) => {
            e.stopPropagation()
            onDocumentClick(document)
          }}
        >
          Start Learning
        </Button>
      </div>

      {/* Last Accessed Indicator */}
      {document.lastAccessed && (
        <div className="absolute top-3 left-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      )}
    </div>
  )
}

const DocumentGrid = ({
  documents,
  isLoading = false,
  onDocumentClick,
  onDocumentDelete,
  className = '',
}: DocumentGridProps) => {
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Your Documents</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Your Documents {documents.length > 0 && `(${documents.length})`}
        </h2>

        {documents.length > 0 && (
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option>Recently uploaded</option>
            <option>Alphabetical</option>
            <option>Most accessed</option>
          </select>
        )}
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-600 mb-6">
            Upload your first PDF to start learning with our AI tutor
          </p>
          <Button
            variant="primary"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            Upload PDF
          </Button>
        </div>
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

export default DocumentGrid
