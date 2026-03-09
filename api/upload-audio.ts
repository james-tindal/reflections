import { UploadAudio } from '.'
import { uploadAudioUrl } from './pulumi-output'

export async function uploadAudio(audioBlob: Blob) {
  const response = await fetch(uploadAudioUrl, {
    method: 'POST',
    headers: { 'Content-Type': audioBlob.type },
    body: audioBlob
  })

  const output = await response.json() as UploadAudio.Output
  if ('error' in output)
    throw Error(output.error)
  else
    return output.url
}
