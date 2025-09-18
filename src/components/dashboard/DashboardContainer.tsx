// components/dashboard/DashboardContainer.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AppLayout from '@/components/layout/AppLayout'
import WelcomeSection from './WelcomeSection'
import UploadArea from './UploadArea'
import DocumentGrid from './DocumentGrid'
import QuickActions from './QuickActions'
import RecentActivity from './RecentActivity'
import Alert from '@/components/ui/Alert'

interface Document {
  id: string
  filename: string
  originalName: string
  fileUrl: string
  pageCount: number
  createdAt: string
  lastAccessed?: string
}

interface DashboardState {
  documents: Document[]
  isLoading: boolean
  error: string
  uploadProgress: number
  isUploading: boolean
}

const DashboardContainer = () => {
  const { user } = useAuth()
  const [state, setState] = useState<DashboardState>({
    documents: [],
    isLoading: true,
    error: '',
    uploadProgress: 0,
    isUploading: false,
  })

  const updateState = (updates: Partial<DashboardState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  // Fetch user documents
  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      updateState({ isLoading: true, error: '' })

      const response = await fetch('/api/documents', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.ok) {
        const { documents } = await response.json()
        updateState({ documents, isLoading: false })
      } else {
        throw new Error('Failed to fetch documents')
      }
    } catch (error) {
      updateState({
        error: 'Failed to load documents. Please try again.',
        isLoading: false,
      })
    }
  }

  const handleFileUpload = async (files: FileList) => {
    const file = files[0]
    if (!file || file.type !== 'application/pdf') {
      updateState({ error: 'Please select a valid PDF file' })
      return
    }

    try {
      updateState({ isUploading: true, uploadProgress: 0, error: '' })

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      })

      if (response.ok) {
        const { document } = await response.json()
        updateState({
          documents: [document, ...state.documents],
          isUploading: false,
          uploadProgress: 100,
        })

        // Reset progress after animation
        setTimeout(() => {
          updateState({ uploadProgress: 0 })
        }, 1000)
      } else {
        const { error } = await response.json()
        throw new Error(error || 'Upload failed')
      }
    } catch (error) {
      const err = error as any
      const message = err instanceof Error ? err.message : String(err)
      updateState({
        error: message || 'Upload failed. Please try again.',
        isUploading: false,
        uploadProgress: 0,
      })
    }
  }

  // Adapter function for DocumentGrid - converts single File to FileList
  const handleSingleFileUpload = async (file: File) => {
    // Create a FileList-like object
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null),
      [Symbol.iterator]: function* () {
        yield file
      },
    } as FileList

    await handleFileUpload(fileList)
  }

  const handleDocumentDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.ok) {
        updateState({
          documents: state.documents.filter((doc) => doc.id !== documentId),
        })
      } else {
        throw new Error('Failed to delete document')
      }
    } catch (error) {
      updateState({ error: 'Failed to delete document. Please try again.' })
    }
  }

  const dismissError = () => {
    updateState({ error: '' })
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Error Alert */}
        {state.error && (
          <Alert variant="error" dismissible onDismiss={dismissError}>
            {state.error}
          </Alert>
        )}

        {/* Welcome Section */}
        <WelcomeSection
          userName={user?.email?.split('@')[0] || 'there'}
          documentCount={state.documents.length}
        />

        {/* Quick Actions */}
        <QuickActions
          onNewDocument={() => document.getElementById('file-upload')?.click()}
          onViewTemplates={() => console.log('View templates')}
          onGetHelp={() => console.log('Get help')}
        />

        {/* Upload Area */}
        <UploadArea
          onFileUpload={handleFileUpload}
          isUploading={state.isUploading}
          uploadProgress={state.uploadProgress}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Documents Section */}
          <div className="lg:col-span-2">
            <DocumentGrid
              documents={state.documents}
              isLoading={state.isLoading}
              onDocumentClick={(doc) => window.open(`/chat/${doc.id}`, '_blank')}
              onDocumentDelete={handleDocumentDelete}
              onFileUpload={handleSingleFileUpload}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecentActivity documents={state.documents.slice(0, 5)} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default DashboardContainer
