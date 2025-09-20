export interface Document {
  id: string
  filename: string
  originalName: string
  fileUrl: string
  pageCount: number
  createdAt: string
}

export interface Annotation {
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

export interface ViewState {
  isFullScreenPDF: boolean
  isFullScreenChat: boolean
  currentPage: number
  pageToNavigate: number | null
}

// Add PDF viewer state
export interface PDFViewerState {
  scale: number
  rotation: number
}

export interface PDFChatState {
  document: Document | null
  annotations: Annotation[]
  viewState: ViewState
  pdfViewerState: PDFViewerState // Add this
  isLoading: boolean
  error: string
}
