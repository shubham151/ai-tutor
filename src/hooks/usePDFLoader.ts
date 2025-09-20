import { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { PDFUtils } from '../utils/PdfUtils'

// Set worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
}

export function usePDFLoader(fileUrl: string) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [totalPages, setTotalPages] = useState(0)
  const pdfDocRef = useRef<any>(null)

  useEffect(() => {
    const loadPDF = async () => {
      if (!fileUrl) return

      try {
        setIsLoading(true)
        setError('')

        console.log('Loading PDF from:', fileUrl)

        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: '//cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        })

        const pdf = await loadingTask.promise
        pdfDocRef.current = pdf
        setTotalPages(pdf.numPages)

        console.log('PDF loaded successfully. Pages:', pdf.numPages)
        setIsLoading(false)
      } catch (err: any) {
        console.error('PDF loading error:', err)
        const errorMessage = PDFUtils.getErrorMessage(err)
        setError(errorMessage)
        setIsLoading(false)
      }
    }

    loadPDF()
  }, [fileUrl])

  return {
    pdfDoc: pdfDocRef.current,
    isLoading,
    error,
    totalPages,
  }
}
