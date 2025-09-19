// app/core/voice-service.ts

function isWebSpeechSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

function createSpeechRecognition(): any | null {
  if (!isWebSpeechSupported()) return null

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'en-US'

  return recognition
}

async function transcribeWithWebAPI(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const recognition = createSpeechRecognition()

    if (!recognition) {
      reject(new Error('Speech recognition not supported'))
      return
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      resolve(transcript)
    }

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`))
    }

    recognition.start()
  })
}

async function transcribeWithBackend(audioBlob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.wav')

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Transcription failed')
  }

  const { text } = await response.json()
  return text
}

async function transcribe(audioBlob: Blob): Promise<string> {
  try {
    // Try web API first for better UX
    if (isWebSpeechSupported()) {
      return await transcribeWithWebAPI(audioBlob)
    }
  } catch (error) {
    console.warn('Web speech API failed, falling back to backend:', error)
  }

  // Fallback to backend transcription
  return await transcribeWithBackend(audioBlob)
}

function speak(text: string, options: { rate?: number; pitch?: number } = {}): void {
  if (!('speechSynthesis' in window)) return

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = options.rate || 0.9
  utterance.pitch = options.pitch || 1

  speechSynthesis.speak(utterance)
}

function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
  }
}

const VoiceService = {
  transcribe,
  speak,
  stopSpeaking,
  isWebSpeechSupported,
}

export default VoiceService
