import { SpeechClient } from '@google-cloud/speech'
import { http } from '@google-cloud/functions-framework'

const speechClient = new SpeechClient()

const MAX_DURATION_MS = 60_000

interface TranscriptionRequest {
  audio: string
  contentType: string
}

interface TranscriptionResponse {
  transcript?: string
  error?: string
}

export async function transcribeAudio(
  audioData: Buffer,
  contentType: string
): Promise<TranscriptionResponse> {
  const audioBytes = audioData.toString('base64')

  const durationMs = estimateAudioDuration(audioData, contentType)
  if (durationMs > MAX_DURATION_MS) {
    return {
      error: `Audio exceeds maximum duration of ${MAX_DURATION_MS / 1000} seconds`
    }
  }

  const [response] = await speechClient.recognize({
    audio: { content: audioBytes },
    config: {
      // encoding: contentType.includes('webm') ? 'WEBM_OPUS' : 'MP3',
      sampleRateHertz: 48000,
      languageCode: 'en-US'
    }
  })

  const transcript = response.results
    ?.map(result => result.alternatives?.[0]?.transcript ?? '')
    .join('\n')

  return { transcript }
}

function estimateAudioDuration(buffer: Buffer, contentType: string): number {
  const bytesPerSecond = contentType.includes('webm') ? 6000 : 16000
  return (buffer.length / bytesPerSecond) * 1000
}

interface HttpRequest {
  method?: string
  body: TranscriptionRequest
}

http('handler', async function (req, res) {
  if (req.method !== 'POST') {
    res.json({ error: 'Method not allowed' })
    return
  }

  try {
    const { audio, contentType } = req.body

    if (!audio) {
      res.json({ error: 'Missing audio field' })
      return
    }

    const audioBuffer = Buffer.from(audio, 'base64')
    const result = await transcribeAudio(audioBuffer, contentType)

    res.json(result)
  } catch (error) {
    res.json({
      error: error instanceof Error ? error.message : 'Transcription failed'
    })
  }
})
