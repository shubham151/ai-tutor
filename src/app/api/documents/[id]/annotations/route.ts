// app/api/documents/[documentId]/annotations/route.ts
import { NextRequest } from 'next/server'
import { withAuth } from '@/middleware'
import { PrismaClient } from '@prisma/client'
import ApiUtils from '@/lib/utils/api-utils'

const prisma = new PrismaClient()

async function getAnnotations(userId: string, documentId: string) {
  // Verify user owns document
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
  })

  if (!document) {
    ApiUtils.throwApiError('Document not found', 404)
  }

  // Get user annotations (exclude text coordinates)
  const annotations = await prisma.annotation.findMany({
    where: {
      documentId,
      type: { not: 'text' }, // Only get user-created annotations
    },
    orderBy: { createdAt: 'desc' },
  })

  return { annotations }
}

async function createAnnotation(userId: string, documentId: string, request: NextRequest) {
  try {
    console.log('createAnnotation called with:', { userId, documentId })

    // Validate documentId is provided
    if (!documentId) {
      ApiUtils.throwApiError('Document ID is required', 400)
    }

    // Verify user owns document
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    })

    if (!document) {
      ApiUtils.throwApiError('Document not found', 404)
    }

    const body = await ApiUtils.parseRequestBody(request)
    console.log('Received annotation data:', body)

    const { pageNumber, x, y, width, height, type, color, text } = body

    // Validate required fields
    if (
      !pageNumber ||
      x === undefined ||
      y === undefined ||
      width === undefined ||
      height === undefined ||
      !type ||
      !color
    ) {
      console.error('Missing required fields:', { pageNumber, x, y, width, height, type, color })
      ApiUtils.throwApiError('Missing required annotation fields', 400)
    }

    // Convert and validate data types
    const annotationData = {
      documentId,
      pageNumber: parseInt(String(pageNumber)),
      x: parseFloat(String(x)),
      y: parseFloat(String(y)),
      width: parseFloat(String(width)),
      height: parseFloat(String(height)),
      type: String(type),
      color: String(color),
      text: text ? String(text) : null,
    }

    console.log('Creating annotation with data:', annotationData)

    const annotation = await prisma.annotation.create({
      data: annotationData,
    })

    console.log('Annotation created successfully:', annotation.id)
    return { annotation }
  } catch (error) {
    console.error('Annotation creation error:', error)
    throw error
  }
}

export const GET = withAuth(
  async (
    userId: string,
    request: NextRequest,
    { params }: { params: Promise<{ documentId: string }> }
  ) => {
    const { documentId } = await params
    return ApiUtils.handleApiRequest(request, () => getAnnotations(userId, documentId))
  }
)

export const POST = withAuth(
  async (
    userId: string,
    request: NextRequest,
    { params }: { params: Promise<{ documentId: string }> }
  ) => {
    const { documentId } = await params
    console.log('Route documentId:', documentId) // Debug log
    return ApiUtils.handleApiRequest(request, () => createAnnotation(userId, documentId, request))
  }
)
