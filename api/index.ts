import { transcribe } from './transcribe'
import { uploadAudio } from './upload-audio'

export namespace Transcribe {
  export type Output = { transcript: string | undefined } | { error: string }
}

export namespace UploadAudio {
  export type Output = { url: string } | { error: string }
}

export const api = {
  transcribe, uploadAudio
}
