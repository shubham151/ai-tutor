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

export interface PDFDocument {
  id: string
  filename: string
  originalName: string
  fileUrl: string
  pageCount: number
  createdAt: string
}
