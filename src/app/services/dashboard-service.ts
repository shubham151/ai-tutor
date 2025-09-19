// app/core/document-service.ts
import Api from '@/core/Api'
import { Document } from '@/types/documents'

async function getAllDocuments(): Promise<Document[]> {
  const response = await Api.get<{ documents: Document[] }>('/api/documents')
  return response.documents
}

async function getDocumentById(id: string): Promise<Document> {
  const response = await Api.get<{ document: Document }>(`/api/documents/${id}`)
  return response.document
}

async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/uploads', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Api.getAuthToken()}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(error.error || 'Upload failed')
  }

  const data = await response.json()
  return data.document
}

async function deleteDocument(documentId: string): Promise<void> {
  await Api.delete(`/api/documents/${documentId}`)
}

async function downloadDocument(document: Document): Promise<void> {
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
    throw new Error('Download failed')
  }
}

async function getDocumentAnnotations(documentId: string): Promise<any[]> {
  const response = await Api.get<{ annotations: any[] }>(`/api/documents/${documentId}/annotations`)
  return response.annotations
}

async function createDocumentAnnotation(documentId: string, annotation: any): Promise<any> {
  const response = await Api.post<{ annotation: any }>(
    `/api/documents/${documentId}/annotations`,
    annotation
  )
  return response.annotation
}

const DocumentService = {
  getAll: getAllDocuments,
  getById: getDocumentById,
  upload: uploadDocument,
  delete: deleteDocument,
  download: downloadDocument,
  getAnnotations: getDocumentAnnotations,
  createAnnotation: createDocumentAnnotation,
}

export default DocumentService
