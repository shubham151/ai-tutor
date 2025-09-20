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

interface DocumentCardProps {
  document: Document
  onDocumentClick: (document: Document) => void
  onDocumentDelete: (documentId: string) => void
}

export function DocumentCard({ document, onDocumentClick, onDocumentDelete }: DocumentCardProps) {
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
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.originalName
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
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
      <DocumentHeader
        onMenuToggle={() => setShowMenu(!showMenu)}
        showMenu={showMenu}
        onDocumentClick={() => onDocumentClick(document)}
        onDownload={handleDownload}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      <DocumentInfo
        document={document}
        formatDate={formatDate}
        truncateFileName={truncateFileName}
      />

      <DocumentActions onDocumentClick={onDocumentClick} document={document} />

      {document.lastAccessed && (
        <div className="absolute top-3 left-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      )}
    </div>
  )
}

interface DocumentHeaderProps {
  onMenuToggle: () => void
  showMenu: boolean
  onDocumentClick: () => void
  onDownload: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
  isDeleting: boolean
}

function DocumentHeader({
  onMenuToggle,
  showMenu,
  onDocumentClick,
  onDownload,
  onDelete,
  isDeleting,
}: DocumentHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <FileText className="w-6 h-6 text-red-600" />
      </div>

      <DocumentMenu
        onMenuToggle={onMenuToggle}
        showMenu={showMenu}
        onDocumentClick={onDocumentClick}
        onDownload={onDownload}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}

interface DocumentMenuProps {
  onMenuToggle: () => void
  showMenu: boolean
  onDocumentClick: () => void
  onDownload: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
  isDeleting: boolean
}

function DocumentMenu({
  onMenuToggle,
  showMenu,
  onDocumentClick,
  onDownload,
  onDelete,
  isDeleting,
}: DocumentMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onMenuToggle()
        }}
        className="p-1 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
          <button
            onClick={() => {
              onDocumentClick()
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            Open & Chat
          </button>

          <button
            onClick={onDownload}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Download
          </button>

          <hr className="my-1 border-gray-100" />

          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {isDeleting ? <LoadingSpinner size="sm" color="red" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

interface DocumentInfoProps {
  document: Document
  formatDate: (date: string) => string
  truncateFileName: (name: string, maxLength?: number) => string
}

function DocumentInfo({ document, formatDate, truncateFileName }: DocumentInfoProps) {
  return (
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
  )
}

interface DocumentActionsProps {
  onDocumentClick: (document: Document) => void
  document: Document
}

function DocumentActions({ onDocumentClick, document }: DocumentActionsProps) {
  return (
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
  )
}
