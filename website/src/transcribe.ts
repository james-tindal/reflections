import { Transcribe } from '@reflections/api'
import TRANSCRIBE_URL from './pulumi-output'

export async function transcribeAudio(audioBlob: Blob) {
  const response = await fetch(TRANSCRIBE_URL, {
    method: 'POST',
    headers: { 'Content-Type': audioBlob.type },
    body: audioBlob
  })

  const output = await response.json() as Transcribe.Output
  if ('error' in output)
    throw Error(output.error)
  else
    return output.transcript ?? ''
}
