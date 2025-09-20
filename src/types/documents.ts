// types/documents.ts

export interface Document {
  id: string
  filename: string
  originalName: string
  fileUrl: string
  pageCount: number
  fileSize: number
  mimeType: string
  createdAt: string
  updatedAt: string
  lastAccessed?: string
  extractedText?: string
  annotations?: any[]
}

export interface DocumentUploadResponse {
  document: Document
}

export interface DocumentListResponse {
  documents: Document[]
}

export interface DocumentAnnotation {
  id: string
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  type: 'highlight' | 'note' | 'drawing'
  color: string
  content?: string
  createdAt: string
}

export interface ActivityItem {
  id: string
  type: 'upload' | 'chat' | 'annotation'
  title: string
  subtitle?: string
  createdAt: string
  document: Document
}

export interface LearningStats {
  documentsUploaded: number
  chatSessions: number
  hoursLearned: number
  annotationsCreated: number
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  action: () => void
}

export interface UploadProgress {
  progress: number
  isUploading: boolean
  fileName?: string
  fileSize?: number
}

export interface PdfExtractionResult {
  pageCount: number
  extractedText: string
  textAndCoords: any[]
}
