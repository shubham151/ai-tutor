'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react'
import PDFViewer from '@/components/pdf/PDFViewer'
import ChatInterface from './ChatInterface'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'

interface Document {
  id: string
  filename: string
  originalName: string
  fileUrl: string
  pageCount: number
  createdAt: string
}

interface Annotation {
  id: string
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  type: 'highlight' | 'circle' | 'arrow'
  color: string
  text?: string
}

interface ChatViewProps {
  documentId: string
}

const ChatView = ({ documentId }: ChatViewProps) => {
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFullScreenPDF, setIsFullScreenPDF] = useState(false)
  const [isFullScreenChat, setIsFullScreenChat] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  // Add a new state to handle AI-triggered page navigation
  const [pageToNavigate, setPageToNavigate] = useState<number | null>(null)

  React.useEffect(() => {
    loadDocument()
    loadAnnotations()
  }, [documentId])

  const loadDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.ok) {
        const { document } = await response.json()
        setDocument(document)
      } else {
        throw new Error('Document not found')
      }
    } catch (err) {
      setError('Failed to load document')
      console.error('Document loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnnotations = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/annotations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.ok) {
        const { annotations } = await response.json()
        setAnnotations(annotations)
      }
    } catch (err) {
      console.error('Annotations loading error:', err)
    }
  }

  const handleAnnotationAdd = useCallback(
    async (newAnnotation: Omit<Annotation, 'id'>) => {
      try {
        const response = await fetch(`/api/documents/${documentId}/annotations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify(newAnnotation),
        })

        if (response.ok) {
          const { annotation } = await response.json()
          setAnnotations((prev) => [...prev, annotation])
        }
      } catch (err) {
        console.error('Failed to add annotation:', err)
      }
    },
    [documentId]
  )

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePageNavigate = useCallback((page: number) => {
    // This function will now update the state, which in turn triggers a re-render
    setPageToNavigate(page)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="error">
          <div className="text-center">
            <p className="mb-4">{error || 'Document not found'}</p>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <div className="h-6 w-px bg-gray-300" />

          <div>
            <h1 className="font-semibold text-gray-900 truncate max-w-96">
              {document.originalName}
            </h1>
            <p className="text-sm text-gray-500">
              {document.pageCount} pages • Page {currentPage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isFullScreenChat && (
            <Button variant="ghost" size="sm" onClick={() => setIsFullScreenPDF(!isFullScreenPDF)}>
              {isFullScreenPDF ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
              PDF
            </Button>
          )}

          {!isFullScreenPDF && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullScreenChat(!isFullScreenChat)}
            >
              {isFullScreenChat ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
              Chat
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        {!isFullScreenChat && (
          <div
            className={`${
              isFullScreenPDF ? 'w-full' : 'w-1/2'
            } border-r border-gray-200 transition-all duration-300`}
          >
            <PDFViewer
              fileUrl={document.fileUrl}
              annotations={annotations}
              onAnnotationAdd={handleAnnotationAdd}
              onPageChange={handlePageChange}
              pageToNavigate={pageToNavigate}
              className="h-full"
            />
          </div>
        )}

        {/* Chat Interface */}
        {!isFullScreenPDF && (
          <div className={`${isFullScreenChat ? 'w-full' : 'w-1/2'} transition-all duration-300`}>
            <ChatInterface
              documentId={documentId}
              onAnnotationRequest={handleAnnotationAdd}
              onPageNavigate={handlePageNavigate}
              className="h-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatView
