import { NextRequest } from 'next/server'
import { withAuth } from '@/middleware'
import DocumentService from '@/lib/services/document-service'
import ApiUtils from '@/lib/utils/api-utils'
import type { PdfExtractionResult } from '@/types/documents'
import * as pdfjs from 'pdfjs-dist'
// @ts-expect-error: No TypeScript declarations for pdf.worker.js
import * as workerSrc from 'pdfjs-dist/build/pdf.worker.js'
;(pdfjs as any).GlobalWorkerOptions.workerSrc = workerSrc as any

async function handleFileUpload(userId: string, request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    ApiUtils.throwApiError('No file uploaded', 400)
  }
  const buffer = Buffer.from(await file.arrayBuffer())
  const pdfExtract = await extractTextFromPdf(buffer)
  const document = await DocumentService.processUpload(file, userId, pdfExtract)
  return { document }
}

async function extractTextFromPdf(buffer: Buffer): Promise<PdfExtractionResult> {
  let extractedText = ''
  let pageCount = 0
  let textAndCoords: any[] = []

  try {
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise
    pageCount = doc.numPages

    for (let i = 1; i <= pageCount; i++) {
      const page = await doc.getPage(i)
      const textContent = await page.getTextContent()
      const viewport = page.getViewport({ scale: 1.0 })

      const pageItems = textContent.items.map((item: any) => {
        const transform = item.transform
        const x = transform[4]
        const y = viewport.height - transform[5] - item.height

        return {
          text: item.str,
          pageNumber: i,
          x: x,
          y: y,
          width: item.width,
          height: item.height,
        }
      })

      extractedText += pageItems.map((item: any) => item.text).join(' ') + '\n'
      textAndCoords = textAndCoords.concat(pageItems)
    }

    return {
      pageCount,
      extractedText: cleanExtractedText(extractedText),
      textAndCoords,
    }
  } catch (error) {
    throw new Error(
      `PDF text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/[^\x20-\x7E\n\r\t]/g, '') // Keep only printable ASCII + newlines/tabs
    .trim()
}

export const POST = withAuth(async (userId: string, request: NextRequest) => {
  return ApiUtils.handleApiRequest(request, () => handleFileUpload(userId, request))
})
