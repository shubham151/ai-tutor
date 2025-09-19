import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware'
import { transcriptionService } from '@/lib/ai/transcription-service'

export const POST = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const transcription = await transcriptionService.transcribeAudio(audioFile)

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
    }

    return NextResponse.json({ text: transcription })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
})
