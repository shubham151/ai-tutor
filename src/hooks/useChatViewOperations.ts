import { useCallback } from 'react'

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

export function useChatViewOperations(documentId: string) {
  const loadDocument = useCallback(async (): Promise<Document> => {
    const response = await fetch(`/api/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Document not found')
    }

    const { document } = await response.json()
    return document
  }, [documentId])

  const loadAnnotations = useCallback(async (): Promise<Annotation[]> => {
    try {
      const response = await fetch(`/api/documents/${documentId}/annotations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.ok) {
        const { annotations } = await response.json()
        return annotations
      }

      return []
    } catch (err) {
      console.error('Annotations loading error:', err)
      return []
    }
  }, [documentId])

  const saveAnnotation = useCallback(
    async (annotation: Omit<Annotation, 'id'>): Promise<Annotation> => {
      const response = await fetch(`/api/documents/${documentId}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(annotation),
      })

      if (!response.ok) {
        throw new Error('Failed to save annotation')
      }

      const { annotation: savedAnnotation } = await response.json()
      return savedAnnotation
    },
    [documentId]
  )

  return {
    loadDocument,
    loadAnnotations,
    saveAnnotation,
  }
}
