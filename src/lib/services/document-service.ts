// lib/services/document-service.ts
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir, unlink, readFile } from 'fs/promises'
import { join } from 'path'
import config from '@/lib/config'

const prisma = new PrismaClient()

interface DocumentData {
  userId: string
  originalName: string
  filename: string
  fileUrl: string
  mimeType: string
  fileSize: number
  pageCount: number
  extractedText?: string
  annotations?: any[]
}

interface PdfExtractionResult {
  pageCount: number
  extractedText: string
  textAndCoords: any[]
}

function generateUniqueFilename(originalName: string): string {
  const createdAt = Date.now()
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${createdAt}-${cleanName}`
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\x00/g, '')
    .replace(/[^\x20-\x7E\n\r\t]/g, '')
    .trim()
}

async function ensureUploadDirectory(): Promise<string> {
  const uploadDir = join(process.cwd(), config.storage.uploadDir)
  await mkdir(uploadDir, { recursive: true })
  return uploadDir
}

async function saveFileToStorage(buffer: Buffer, filename: string): Promise<string> {
  const uploadDir = await ensureUploadDirectory()
  const filepath = join(uploadDir, filename)
  await writeFile(filepath, buffer)
  return filepath
}

async function deleteFileFromStorage(filename: string): Promise<void> {
  try {
    const filepath = join(process.cwd(), config.storage.uploadDir, filename)
    await unlink(filepath)
  } catch (error) {
    console.warn('Failed to delete physical file:', error)
  }
}

async function validateFile(file: File): Promise<void> {
  if (!config.storage.allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`)
  }

  if (file.size > config.storage.maxFileSize) {
    throw new Error(`File size exceeds maximum allowed size of ${config.storage.maxFileSize} bytes`)
  }
}

async function processUpload(
  file: File,
  userId: string,
  pdfData: PdfExtractionResult
): Promise<any> {
  await validateFile(file)

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = generateUniqueFilename(file.name)
  await saveFileToStorage(buffer, filename)

  const document = await prisma.document.create({
    data: {
      userId,
      filename,
      originalName: file.name,
      fileUrl: `${config.storage.publicUrl}/${filename}`,
      mimeType: file.type,
      fileSize: file.size,
      pageCount: pdfData.pageCount,
      extractedText: pdfData.extractedText.substring(0, 50000), // Limit text size
    },
  })

  // Store text coordinates as annotations for highlighting
  if (pdfData.textAndCoords.length > 0) {
    console.log(`Saving ${pdfData.textAndCoords.length} text coordinates to database`)

    // Group by page for debugging
    const pageGroups = pdfData.textAndCoords.reduce((acc, coord) => {
      acc[coord.pageNumber] = (acc[coord.pageNumber] || 0) + 1
      return acc
    }, {})
    console.log('Text coordinates per page:', pageGroups)

    // Batch insert in chunks to handle large documents
    const chunkSize = 1000
    for (let i = 0; i < pdfData.textAndCoords.length; i += chunkSize) {
      const chunk = pdfData.textAndCoords.slice(i, i + chunkSize)
      console.log(`Inserting chunk ${Math.floor(i / chunkSize) + 1}: ${chunk.length} items`)

      await prisma.annotation.createMany({
        data: chunk.map((coord) => ({
          documentId: document.id,
          pageNumber: coord.pageNumber,
          x: coord.x,
          y: coord.y,
          width: coord.width,
          height: coord.height,
          type: 'text',
          color: 'transparent',
          text: coord.text,
        })),
      })
    }

    console.log('All text coordinates saved successfully')
  }

  return document
}

async function getDocumentsByUser(userId: string): Promise<any[]> {
  return await prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      filename: true,
      originalName: true,
      fileUrl: true,
      pageCount: true,
      fileSize: true,
      mimeType: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

async function getDocumentById(documentId: string, userId: string): Promise<any | null> {
  return await prisma.document.findFirst({
    where: { id: documentId, userId },
  })
}

async function deleteDocument(documentId: string, userId: string): Promise<void> {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
  })

  if (!document) {
    throw new Error('Document not found')
  }

  // Delete from database
  await prisma.document.delete({
    where: { id: documentId },
  })

  // Delete physical file
  await deleteFileFromStorage(document.filename)
}

async function updateDocument(
  documentId: string,
  userId: string,
  updates: { originalName?: string }
): Promise<any> {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
  })

  if (!document) {
    throw new Error('Document not found')
  }

  return await prisma.document.update({
    where: { id: documentId },
    data: {
      ...updates,
      updatedAt: new Date(),
    },
  })
}

async function serveDocument(filename: string, userId: string): Promise<Buffer> {
  // Verify user owns the document
  const document = await prisma.document.findFirst({
    where: { filename, userId },
  })

  if (!document) {
    throw new Error('Document not found or access denied')
  }

  const filepath = join(process.cwd(), config.storage.uploadDir, filename)
  return await readFile(filepath)
}

const DocumentService = {
  processUpload,
  getByUser: getDocumentsByUser,
  getById: getDocumentById,
  delete: deleteDocument,
  update: updateDocument,
  serve: serveDocument,
}

export default DocumentService
