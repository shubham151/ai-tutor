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
    const doc = await pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
    }).promise

    pageCount = doc.numPages

    for (let i = 1; i <= pageCount; i++) {
      const page = await doc.getPage(i)

      // Get text content with proper options
      const textContent = await page.getTextContent({
        includeMarkedContent: false,
        disableNormalization: false,
      })

      const viewport = page.getViewport({ scale: 1.0 })

      // Process text items with better filtering
      const pageItems = textContent.items
        .filter((item: any) => {
          // Filter out items without text or with only whitespace
          return item.str && item.str.trim().length > 0
        })
        .map((item: any) => {
          const transform = item.transform

          // Normalize coordinates to 0-1 range for consistency
          const normalizedX = transform[4] / viewport.width
          const normalizedY = (viewport.height - transform[5]) / viewport.height
          const normalizedWidth = item.width / viewport.width
          const normalizedHeight = item.height / viewport.height

          return {
            text: item.str,
            pageNumber: i,
            x: Math.max(0, Math.min(1, normalizedX)), // Clamp to 0-1
            y: Math.max(0, Math.min(1, normalizedY)),
            width: Math.max(0, Math.min(1, normalizedWidth)),
            height: Math.max(0, Math.min(1, normalizedHeight)),
          }
        })

      // Sort items by position (top-to-bottom, left-to-right)
      pageItems.sort((a, b) => {
        const yDiff = a.y - b.y
        if (Math.abs(yDiff) > 0.01) {
          // Same line threshold
          return yDiff
        }
        return a.x - b.x
      })

      // Build text with better spacing
      let pageText = ''
      let lastY = -1
      let lastX = -1

      for (const item of pageItems) {
        // Add line break if we moved to a new line
        if (lastY >= 0 && Math.abs(item.y - lastY) > 0.01) {
          pageText += '\n'
        }
        // Add space if there's a gap on the same line
        else if (lastX >= 0 && item.x - lastX > 0.02) {
          pageText += ' '
        }

        pageText += item.text
        lastY = item.y
        lastX = item.x + item.width
      }

      extractedText += pageText + '\n\n'
      textAndCoords = textAndCoords.concat(pageItems)

      console.log(`Page ${i}: Extracted ${pageItems.length} text items`)
    }

    console.log(`Total text extraction: ${textAndCoords.length} items across ${pageCount} pages`)

    return {
      pageCount,
      extractedText: cleanExtractedText(extractedText),
      textAndCoords,
    }
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error(
      `PDF text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim()
}

export const POST = withAuth(async (userId: string, request: NextRequest) => {
  return ApiUtils.handleApiRequest(request, () => handleFileUpload(userId, request))
})
