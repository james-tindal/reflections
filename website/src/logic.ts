import { AudioRecorder } from './audio-recorder'
import { Store } from './store'
import { api } from '@reflections/api'

type UiState = {
  isRecording: boolean
  audioBlob?: Blob
  transcript?: string
  status: string
  isLoading: boolean
  sharedUrl?: string
}
export const store = Store<UiState>({
  isRecording: false,
  isLoading: false,
  status: '',
  sharedUrl: undefined,
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
      store.transcript = await api.transcribe(blob)
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
    store.sharedUrl = undefined
    recorder.start()
  }
}

export async function shareRecording() {
  const blob = store.audioBlob
  if (!blob) return

  store.isLoading = true
  store.status = 'Uploading...'

  try {
    store.sharedUrl = await api.uploadAudio(blob)
    store.status = 'Upload complete!'
  } catch (err) {
    store.status = `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`
  }

  store.isLoading = false
}
