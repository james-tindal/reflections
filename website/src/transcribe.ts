import TRANSCRIBE_URL from './pulumi-output'

export async function transcribeAudio(audioBlob: Blob) {
  const response = await fetch(TRANSCRIBE_URL, {
    method: 'POST',
    headers: { 'Content-Type': audioBlob.type },
    body: audioBlob
  })

  return response.json()
    .then(x => x.transcript as string)
}
