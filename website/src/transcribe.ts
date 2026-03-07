import TRANSCRIBE_URL from './stack-output'

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const base64 = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  )
  return base64
}

export async function transcribeAudio(audioBlob: Blob) {
  const base64Audio = await blobToBase64(audioBlob)

  const response = await fetch(TRANSCRIBE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audio: base64Audio,
      contentType: audioBlob.type
    })
  })

  return response.json()
    .then(x => x.transcript as string)
}
