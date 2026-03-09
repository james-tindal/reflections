import { SpeechClient } from '@google-cloud/speech'
import { http } from '@google-cloud/functions-framework'
import type { Transcribe } from '@reflections/api'
import type { Response } from '@google-cloud/functions-framework'

const speechClient = new SpeechClient()

export async function transcribeAudio(audioData: Buffer) {
  const [response] = await speechClient.recognize({
    audio: { content: audioData },
    config: { languageCode: 'en-US' },
  })

  const transcript = response.results
    ?.map(result => result.alternatives?.[0]?.transcript ?? '')
    .join('\n')

  return { transcript }
}

export async function handler(req: any, res: Response<Transcribe.Output>) {
  if (req.method !== 'POST') {
    res.json({ error: 'Method not allowed' })
    return
  }

  try {
    const audioBuffer = req.body

    if (!audioBuffer || audioBuffer.length === 0) {
      res.json({ error: 'Missing audio data' })
      return
    }

    const result = await transcribeAudio(audioBuffer)

    res.json(result)
  } catch (error) {
    res.json({
      error: error instanceof Error ? error.message : 'Transcription failed'
    })
  }
}

http('handler', handler)
