import { AudioRecorder } from './audio-recorder'
import { Store } from './store'
import { transcribeAudio } from './transcribe'
import { UploadAudio } from '@reflections/contract'

const UPLOAD_URL = ''

type UiState = {
  isRecording: boolean
  audioBlob?: Blob
  transcript?: string
  status: string
  isLoading: boolean
  sharedAudioUrl?: string
}
export const store = Store<UiState>({
  isRecording: false,
  isLoading: false,
  status: '',
  sharedAudioUrl: undefined,
})

const recorder = new AudioRecorder({
  error: (err) => {
    store.status = `Error: ${err.message}`
    store.isRecording = false
  },
  audio: async (blob) => {
    store.audioBlob = blob
    store.status = 'Transcribing...'
    store.isLoading = true
    
    try {
      store.transcript = await transcribeAudio(blob)
      store.status = 'Done!'
    } catch (err) {
      store.status = `Transcription failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
    
    store.isLoading = false
    store.isRecording = false
  }
})

export function toggleRecording() {
  if (store.isRecording)
    recorder.stop()
  else {
    store.isRecording = true
    store.status = 'Recording...'
    store.audioBlob = undefined
    store.transcript = undefined
    store.sharedAudioUrl = undefined
    recorder.start()
  }
}

export async function shareRecording() {
  const blob = store.audioBlob
  if (!blob) return

  store.isLoading = true
  store.status = 'Uploading...'

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': blob.type },
      body: blob
    })

    const output = await response.json() as UploadAudio.Output
    if ('error' in output) {
      store.status = `Upload failed: ${output.error}`
    } else {
      store.sharedAudioUrl = output.url
      store.status = 'Upload complete!'
    }
  } catch (err) {
    store.status = `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`
  }

  store.isLoading = false
}
