// hooks/dashboard-hooks.ts
import { useState, useEffect, useCallback } from 'react'
import DocumentService from '@/app/services/dashboard-service'
import { Document } from '@/types/documents'

interface DashboardState {
  documents: Document[]
  isLoading: boolean
  error: string
  uploadProgress: number
  isUploading: boolean
}

function createInitialDashboardState(): DashboardState {
  return {
    documents: [],
    isLoading: true,
    error: '',
    uploadProgress: 0,
    isUploading: false,
  }
}

export function useDashboardState() {
  const [state, setState] = useState(createInitialDashboardState())

  const updateState = useCallback((updates: Partial<DashboardState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const setLoading = useCallback(
    (isLoading: boolean) => {
      updateState({ isLoading })
    },
    [updateState]
  )

  const setError = useCallback(
    (error: string) => {
      updateState({ error })
    },
    [updateState]
  )

  const clearError = useCallback(() => {
    updateState({ error: '' })
  }, [updateState])

  const setUploadProgress = useCallback(
    (progress: number, isUploading: boolean = true) => {
      updateState({ uploadProgress: progress, isUploading })
    },
    [updateState]
  )

  const addDocument = useCallback((document: Document) => {
    setState((prev) => ({
      ...prev,
      documents: [document, ...prev.documents],
    }))
  }, [])

  const removeDocument = useCallback((documentId: string) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== documentId),
    }))
  }, [])

  const setDocuments = useCallback((documents: Document[]) => {
    setState((prev) => ({
      ...prev,
      documents,
    }))
  }, [])

  return {
    ...state,
    updateState,
    setLoading,
    setError,
    clearError,
    setUploadProgress,
    addDocument,
    removeDocument,
    setDocuments,
  }
}

export function useDocumentOperations() {
  const fetchDocuments = useCallback(async (): Promise<Document[]> => {
    return await DocumentService.getAll()
  }, [])

  const uploadDocument = useCallback(async (file: File): Promise<Document> => {
    return await DocumentService.upload(file)
  }, [])

  const deleteDocument = useCallback(async (documentId: string): Promise<void> => {
    await DocumentService.delete(documentId)
  }, [])

  const downloadDocument = useCallback(async (document: Document): Promise<void> => {
    await DocumentService.download(document)
  }, [])

  return {
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    downloadDocument,
  }
}

export function useFileUpload() {
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    if (file.type !== 'application/pdf') {
      return { isValid: false, error: 'Please select a valid PDF file' }
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 10MB' }
    }

    return { isValid: true }
  }, [])

  const createFileList = useCallback((file: File): FileList => {
    return {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null),
      [Symbol.iterator]: function* () {
        yield file
      },
    } as FileList
  }, [])

  return {
    validateFile,
    createFileList,
  }
}

export function useUploadFlow() {
  const { validateFile } = useFileUpload()
  const { uploadDocument } = useDocumentOperations()

  const handleUpload = useCallback(
    async (
      file: File,
      onProgress: (progress: number) => void,
      onSuccess: (document: Document) => void,
      onError: (error: string) => void
    ) => {
      const validation = validateFile(file)
      if (!validation.isValid) {
        onError(validation.error!)
        return
      }

      try {
        onProgress(0)

        // Simulate progress for better UX
        let currentProgress = 0
        const progressInterval = setInterval(() => {
          currentProgress = Math.min(currentProgress + 10, 90)
          onProgress(currentProgress)
        }, 100)

        const document = await uploadDocument(file)

        clearInterval(progressInterval)
        onProgress(100)
        onSuccess(document)

        // Reset progress after animation
        setTimeout(() => {
          onProgress(0)
        }, 1000)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed. Please try again.'
        onError(message)
      }
    },
    [validateFile, uploadDocument]
  )

  return {
    handleUpload,
  }
}
