// lib/ai/tutor-service.ts
import aiFactory from './factory'
import { AIMessage } from './base-service'
import config from '@/lib/config'

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
- Document text preview: ${document.extractedText?.slice(0, 2000) || 'Not available'}

Your capabilities:
1. Answer questions about the document content
2. Reference specific pages when relevant
3. Suggest highlights or annotations to help learning
4. Provide clear explanations of concepts

When referencing content:
- Include page numbers when possible
- Suggest highlighting important sections
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

function createHighlightAnnotations(pageReferences: number[]): Annotation[] {
  return pageReferences.map((pageNumber) => ({
    pageNumber,
    x: 0.1,
    y: 0.5,
    width: 0.8,
    height: 0.1,
    type: 'highlight' as const,
    color: '#ffff00',
    content: 'AI suggested highlight',
  }))
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
    const annotations = createHighlightAnnotations(pageReferences)
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
  const aiService = aiFactory.getDefaultService()

  if (!document.extractedText) {
    return []
  }

  try {
    const prompt = pageNumber
      ? `Suggest important sections to highlight on page ${pageNumber} of this document`
      : `Suggest 3-5 important sections to highlight throughout this document`

    const response = await aiService.generateText(
      `${prompt}: ${document.extractedText.slice(0, 3000)}`,
      {
        systemPrompt: config.ai.systemPrompts.annotator,
        temperature: 0.3,
        maxTokens: 300,
      }
    )

    // Parse response and create annotations (simplified logic)
    const suggestions = response.content.split('\n').filter((line) => line.trim())

    return suggestions.slice(0, 5).map((_, index) => ({
      pageNumber: pageNumber || index + 1,
      x: 0.1,
      y: 0.2 + index * 0.15,
      width: 0.8,
      height: 0.1,
      type: 'highlight' as const,
      color: '#ffff00',
      content: `AI suggestion ${index + 1}`,
    }))
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
