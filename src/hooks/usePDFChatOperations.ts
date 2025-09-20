// hooks/usePDFChatOperations.ts (Fixed to prevent infinite loops)
import { useCallback, useMemo } from 'react'
import { Document, Annotation } from '@/types/pdfChat'

export function usePDFChatOperations(documentId: string) {
  // Memoize operations with stable references
  const operations = useMemo(() => {
    const loadDocument = async (): Promise<Document> => {
      if (!documentId) {
        throw new Error('Document ID is required')
      }

      console.log('Loading document with ID:', documentId)

      const response = await fetch(`/api/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Document not found')
        } else if (response.status === 401) {
          throw new Error('Unauthorized access')
        } else {
          throw new Error(`Failed to load document: ${response.statusText}`)
        }
      }

      const data = await response.json()

      if (!data.document) {
        throw new Error('Invalid response format: missing document')
      }

      return data.document
    }

    const loadAnnotations = async (): Promise<Annotation[]> => {
      if (!documentId) {
        console.warn('No documentId provided for loading annotations')
        return []
      }

      try {
        console.log('Loading annotations for document ID:', documentId)

        const response = await fetch(`/api/documents/${documentId}/annotations`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          return data.annotations || []
        } else {
          console.warn('Failed to load annotations:', response.statusText)
          return []
        }
      } catch (err) {
        console.error('Annotations loading error:', err)
        return []
      }
    }

    const saveAnnotation = async (annotation: Omit<Annotation, 'id'>): Promise<Annotation> => {
      if (!documentId) {
        throw new Error('Document ID is required')
      }

      const response = await fetch(`/api/documents/${documentId}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(annotation),
      })

      if (!response.ok) {
        throw new Error(`Failed to save annotation: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.annotation) {
        throw new Error('Invalid response format: missing annotation')
      }

      return data.annotation
    }

    return {
      loadDocument,
      loadAnnotations,
      saveAnnotation,
    }
  }, [documentId]) // Only depend on documentId

  return operations
}
