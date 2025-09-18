import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import * as pdfjs from 'pdfjs-dist'
// @ts-expect-error: No TypeScript declarations for pdf.worker.js
import * as workerSrc from 'pdfjs-dist/build/pdf.worker.js'
;(pdfjs as any).GlobalWorkerOptions.workerSrc = workerSrc as any

const prisma = new PrismaClient()

async function extractTextFromPdfjs(buffer: Buffer) {
  let extractedText = ''
  let pageCount = 0
  let textAndCoords: any = []

  try {
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise
    pageCount = doc.numPages

    for (let i = 1; i <= pageCount; i++) {
      const page = await doc.getPage(i)
      const textContent = await page.getTextContent()
      const viewport = page.getViewport({ scale: 1.0 })

      // Concatenate the text items from the page content.
      const pageItems = textContent.items.map((item: any) => {
        const transform = item.transform
        const x = transform[4]
        const y = viewport.height - transform[5] - item.height
        const width = item.width
        const height = item.height
        return {
          text: item.str,
          pageNumber: i,
          x: x,
          y: y,
          width: width,
          height: height,
        }
      })
      extractedText += pageItems.map((item: any) => item.text).join(' ') + '\n'
      textAndCoords = textAndCoords.concat(pageItems)
    }

    console.log(
      `DEBUG: PDF.js text extraction complete. Total text length: ${extractedText.length}`
    )
  } catch (error) {
    console.error('PDF.js text extraction error:', error)
    // Throw the error so the main function can catch it and return a 500 status.
    throw new Error('Failed to parse PDF file with pdf.js')
  }

  return { pageCount, extractedText, textAndCoords }
}

export const POST = withAuth(async (userId: string, request: NextRequest) => {
  console.log('=== Upload route started ===')

  try {
    let data: FormData
    try {
      data = await request.formData()
      console.log('DEBUG: Successfully parsed form data.')
    } catch (formDataError) {
      console.error('FormData parsing error:', formDataError)
      return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 })
    }

    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      console.log('DEBUG: No file found in form data.')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    console.log(`DEBUG: File found. Name: ${file.name}, Type: ${file.type}, Size: ${file.size}`)

    // Validate file type
    if (file.type !== 'application/pdf') {
      console.log('DEBUG: Invalid file type. Received:', file.type)
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      console.log('DEBUG: File size too large. Received:', file.size)
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name
    const filename = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    console.log('DEBUG: Generated filename:', filename)

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
      console.log('DEBUG: Upload directory exists or was created.')
    } catch (error) {
      console.error('Failed to create upload directory:', error)
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Save file to uploads directory
    const filepath = join(uploadDir, filename)
    try {
      await writeFile(filepath, buffer)
      console.log('DEBUG: File successfully written to:', filepath)
    } catch (error) {
      console.error('Failed to write file:', error)
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
    }

    // Extract PDF metadata and text using the new approach
    let pageCount = 0
    let extractedText = ''
    let extractedAnnotations: any = []

    try {
      console.log('Attempting PDF parsing with pdf.js...')
      const pdfData = await extractTextFromPdfjs(buffer)
      pageCount = pdfData.pageCount
      extractedText = pdfData.extractedText
      extractedAnnotations = pdfData.textAndCoords

      // Clean the extracted text
      extractedText = extractedText
        .replace(/\x00/g, '') // Remove null bytes
        .replace(/[^\x20-\x7E\n\r\t]/g, '') // Keep only printable ASCII + newlines/tabs
        .trim()

      console.log('PDF parsing successful. Pages:', pageCount, 'Text length:', extractedText.length)
    } catch (pdfJsError) {
      console.error('Critical PDF parsing error:', pdfJsError)
      return NextResponse.json({ error: 'Failed to process PDF file' }, { status: 500 })
    }

    // Save document to database
    try {
      const document = await prisma.document.create({
        data: {
          userId,
          filename,
          originalName,
          fileUrl: `/api/uploads/${filename}`,
          mimeType: file.type,
          fileSize: file.size,
          pageCount: pageCount || 1,
          extractedText: extractedText ? extractedText.substring(0, 50000) : null,
          annotations: extractedAnnotations,
        },
      })
      console.log('Document saved successfully:', document.id)
      return NextResponse.json({ document })
    } catch (dbError) {
      console.error('Database save error:', dbError)
      return NextResponse.json({ error: 'Failed to save document to database' }, { status: 500 })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
})
