import { GoogleGenerativeAI } from '@google/generative-ai'
import config from '@/lib/config'

/**
 * Service for handling speech-to-text transcription via a backend API.
 */
class TranscriptionService {
  private genAI: GoogleGenerativeAI
  private readonly model = config.ai.providers.google.model

  constructor() {
    if (!config.ai.providers.google.apiKey) {
      throw new Error('Google API key is not configured for transcription.')
    }
    this.genAI = new GoogleGenerativeAI(config.ai.providers.google.apiKey)
  }

  public async transcribeAudio(audioFile: File): Promise<string> {
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })

      const result = await model.generateContent([
        {
          text: 'Transcribe the following audio file. Only return the transcribed text.',
        },
        {
          inlineData: {
            data: audioBuffer.toString('base64'),
            mimeType: audioFile.type,
          },
        },
      ])

      const transcription = result.response.text()
      return transcription
    } catch (error) {
      throw new Error(
        `Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

export const transcriptionService = new TranscriptionService()
export default transcriptionService
