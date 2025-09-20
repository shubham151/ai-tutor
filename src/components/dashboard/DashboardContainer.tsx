'use client'

import React, { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  useDashboardState,
  useDocumentOperations,
  useFileUpload,
  useUploadFlow,
} from '@/hooks/dashboard-hooks'
import AppLayout from '@/components/layout/AppLayout'
import { WelcomeSection } from './WelcomeSection/WelcomeSection'
import { UploadArea } from './UploadArea/UploadArea'
import { DocumentGrid } from './DocumentGrid/DocumentGrid'
import { QuickActions } from './QuickActions/QuickActions'
import { RecentActivity } from './RecentActivity/RecentActivity'
import Alert from '@/components/ui/Alert'

function useQuickActions() {
  const handleNewDocument = () => {
    document.getElementById('file-upload')?.click()
  }

  const handleViewTemplates = () => {
    console.log('View templates')
  }

  const handleGetHelp = () => {
    console.log('Get help')
  }

  return {
    handleNewDocument,
    handleViewTemplates,
    handleGetHelp,
  }
}

interface DashboardErrorProps {
  error: string
  onDismiss: () => void
}

function DashboardError({ error, onDismiss }: DashboardErrorProps) {
  if (!error) return null

  return (
    <Alert variant="error" dismissible onDismiss={onDismiss}>
      {error}
    </Alert>
  )
}

export function DashboardContainer() {
  const { user } = useAuth()
  const dashboardState = useDashboardState()
  const documentOps = useDocumentOperations()
  const { createFileList } = useFileUpload()
  const { handleUpload } = useUploadFlow()
  const quickActions = useQuickActions()

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        dashboardState.setLoading(true)
        dashboardState.clearError()
        const documents = await documentOps.fetchDocuments()
        dashboardState.setDocuments(documents)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load documents'
        dashboardState.setError(message)
      } finally {
        dashboardState.setLoading(false)
      }
    }

    loadDocuments()
  }, [])

  // Handle file upload from FileList (drag/drop or browse)
  const handleFileUpload = async (files: FileList) => {
    const file = files[0]
    if (!file) return

    await handleUpload(
      file,
      (progress) => dashboardState.setUploadProgress(progress, progress < 100),
      (document) => dashboardState.addDocument(document),
      (error) => dashboardState.setError(error)
    )
  }

  // Handle single file upload (from DocumentGrid)
  const handleSingleFileUpload = async (file: File) => {
    const fileList = createFileList(file)
    await handleFileUpload(fileList)
  }

  // Handle document deletion
  const handleDocumentDelete = async (documentId: string) => {
    try {
      await documentOps.deleteDocument(documentId)
      dashboardState.removeDocument(documentId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete document'
      dashboardState.setError(message)
    }
  }

  const handleDocumentClick = (doc: any) => {
    window.open(`/chat/${doc.id}`, '_blank')
  }
  const userName = user?.email?.split('@')[0] || 'there'

  return (
    <AppLayout>
      <div className="space-y-8">
        <DashboardError error={dashboardState.error} onDismiss={dashboardState.clearError} />

        <WelcomeSection userName={userName} documentCount={dashboardState.documents.length} />

        <QuickActions
          onNewDocument={quickActions.handleNewDocument}
          onViewTemplates={quickActions.handleViewTemplates}
          onGetHelp={quickActions.handleGetHelp}
        />

        <UploadArea
          onFileUpload={handleFileUpload}
          isUploading={dashboardState.isUploading}
          uploadProgress={dashboardState.uploadProgress}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DocumentGrid
              documents={dashboardState.documents}
              isLoading={dashboardState.isLoading}
              onDocumentClick={handleDocumentClick}
              onDocumentDelete={handleDocumentDelete}
              onFileUpload={handleSingleFileUpload}
            />
          </div>

          <div className="space-y-6">
            <RecentActivity documents={dashboardState.documents.slice(0, 5)} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default DashboardContainer
