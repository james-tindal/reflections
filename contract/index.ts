
export namespace Transcribe {
  export type Output = { transcript: string | undefined } | { error: string }
}

export namespace UploadAudio {
  export type Output = { url: string } | { error: string }
}
