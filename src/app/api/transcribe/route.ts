import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

export const POST = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Convert the audio file to a buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    // Use the Gemini model to transcribe the audio.
    const result = await generateText({
      model: google('models/gemini-pro'), // Use the correct Gemini model
      prompt: 'Transcribe the following audio file:',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Transcribe the following audio file:' },
            {
              type: 'audio',
              audio: audioBuffer,
            },
          ],
        },
      ],
    })

    const transcription = result.text

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
    }

    return NextResponse.json({ text: transcription })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
})
