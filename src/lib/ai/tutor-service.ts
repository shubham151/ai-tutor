// lib/ai/tutor-service.ts
import aiFactory from './factory'
import { AIMessage } from './base-service'
import config from '@/lib/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Document {
  id: string
  originalName: string
  pageCount: number
  extractedText?: string
}

interface TutorResponse {
  content: string
  pageReference?: number
  annotations: Annotation[]
  confidence: number
}

interface Annotation {
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  type: 'highlight' | 'note' | 'drawing'
  color: string
  content?: string
  text?: string
}

interface ConversationContext {
  messages: AIMessage[]
  document: Document
}

function createTutorSystemPrompt(document: Document): string {
  return `${config.ai.systemPrompts.tutor}

Document context:
- Document name: ${document.originalName}
- Total pages: ${document.pageCount}
- Document content with page markers: ${document.extractedText || 'Not available'}

Your capabilities:
1. Answer questions about the document content
2. Reference specific pages when relevant (you can see [PAGE X] markers)
3. Suggest highlights or annotations to help learning
4. Provide clear explanations of concepts

When referencing content:
- Use the [PAGE X] markers to identify which page contains specific information
- Include accurate page numbers when suggesting highlights
- Use simple, clear language
- Be encouraging and supportive`
}

function extractPageReferences(text: string): number[] {
  const pageMatches = text.match(/page\s+(\d+)/gi) || []
  return pageMatches
    .map((match) => {
      const num = match.match(/\d+/)
      return num ? parseInt(num[0], 10) : 0
    })
    .filter((num) => num > 0)
}

async function findTextToHighlight(
  documentId: string,
  searchText: string,
  pageNumber?: number
): Promise<Annotation[]> {
  try {
    // Get text coordinates from annotations table
    const textCoords = await prisma.annotation.findMany({
      where: {
        documentId,
        type: 'text',
        ...(pageNumber && { pageNumber }),
        text: { contains: searchText, mode: 'insensitive' },
      },
      take: 5, // Limit to 5 matches
    })

    return textCoords.map((coord) => ({
      pageNumber: coord.pageNumber,
      x: coord.x,
      y: coord.y,
      width: coord.width,
      height: coord.height,
      type: 'highlight' as const,
      color: '#ffff00',
      content: coord.text || 'Highlighted text',
      text: coord.text || '',
    }))
  } catch (error) {
    console.error('Failed to find text coordinates:', error)
    return []
  }
}

async function createSmartHighlightAnnotations(
  documentId: string,
  aiResponse: string,
  pageReferences: number[]
): Promise<Annotation[]> {
  const annotations: Annotation[] = []

  // Extract key phrases from AI response that might be in the document
  const keyPhrases = extractKeyPhrases(aiResponse)

  for (const phrase of keyPhrases) {
    for (const pageNumber of pageReferences) {
      const matches = await findTextToHighlight(documentId, phrase, pageNumber)
      annotations.push(...matches)
    }
  }

  // If no specific matches, try broader search
  if (annotations.length === 0 && pageReferences.length > 0) {
    const words = aiResponse
      .split(' ')
      .filter((word) => word.length > 4 && /^[a-zA-Z]+$/.test(word))
      .slice(0, 3)

    for (const word of words) {
      for (const pageNumber of pageReferences) {
        const matches = await findTextToHighlight(documentId, word, pageNumber)
        annotations.push(...matches.slice(0, 2)) // Limit matches per word
      }
    }
  }

  return annotations.slice(0, 10) // Limit total annotations
}

function extractKeyPhrases(text: string): string[] {
  // Extract phrases in quotes or emphasized text
  const quotedPhrases = text.match(/"([^"]+)"/g)?.map((match) => match.slice(1, -1)) || []
  const emphasized = text.match(/\*\*([^*]+)\*\*/g)?.map((match) => match.slice(2, -2)) || []

  // Extract noun phrases (simplified)
  const words = text.split(/\s+/)
  const phrases: string[] = []

  for (let i = 0; i < words.length - 1; i++) {
    const twoWords = `${words[i]} ${words[i + 1]}`.replace(/[^\w\s]/g, '')
    if (twoWords.length > 6) {
      phrases.push(twoWords)
    }
  }

  return [...quotedPhrases, ...emphasized, ...phrases.slice(0, 5)]
    .filter((phrase) => phrase.length > 3)
    .slice(0, 10)
}

function calculateConfidence(response: string, document: Document): number {
  let confidence = 0.5 // Base confidence

  // Increase confidence if document content is available
  if (document.extractedText && document.extractedText.length > 100) {
    confidence += 0.2
  }

  // Increase confidence if response contains page references
  const pageRefs = extractPageReferences(response)
  if (pageRefs.length > 0) {
    confidence += 0.2
  }

  // Increase confidence if response is detailed (longer than 100 chars)
  if (response.length > 100) {
    confidence += 0.1
  }

  return Math.min(confidence, 1.0)
}

async function generateTutorResponse(
  userMessage: string,
  context: ConversationContext
): Promise<TutorResponse> {
  const aiService = aiFactory.getDefaultService()
  const systemPrompt = createTutorSystemPrompt(context.document)

  try {
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...context.messages,
      { role: 'user', content: userMessage },
    ]

    const aiResponse = await aiService.generateWithMessages(messages, {
      systemPrompt,
      temperature: 0.7,
    })

    const pageReferences = extractPageReferences(aiResponse.content)
    const annotations = await createSmartHighlightAnnotations(
      context.document.id,
      aiResponse.content,
      pageReferences
    )
    const confidence = calculateConfidence(aiResponse.content, context.document)

    return {
      content: aiResponse.content,
      pageReference: pageReferences[0],
      annotations,
      confidence,
    }
  } catch (error) {
    throw new Error(
      `Tutor service failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

async function summarizeDocument(document: Document): Promise<string> {
  const aiService = aiFactory.getDefaultService()

  if (!document.extractedText) {
    return 'Document summary not available - no text content found.'
  }

  try {
    const response = await aiService.generateText(
      `Please provide a concise summary of this document: ${document.extractedText.slice(0, 4000)}`,
      {
        systemPrompt: config.ai.systemPrompts.summarizer,
        temperature: 0.5,
        maxTokens: 500,
      }
    )

    return response.content
  } catch (error) {
    throw new Error(
      `Document summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

async function suggestAnnotations(document: Document, pageNumber?: number): Promise<Annotation[]> {
  try {
    // Get actual text coordinates for suggestions
    return await findTextToHighlight(document.id, '', pageNumber)
  } catch (error) {
    console.error('Annotation suggestion failed:', error)
    return []
  }
}

const TutorService = {
  generateResponse: generateTutorResponse,
  summarizeDocument,
  suggestAnnotations,
}

export default TutorService
