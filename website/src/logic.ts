import { AudioRecorder } from './audio-recorder'
import { Store } from './store'
import { transcribeAudio } from './transcribe'

type UiState = {
  isRecording: boolean
  audioBlob?: Blob
  transcript?: string
  status: string
  isLoading: boolean
}
export const store = Store<UiState>({
  isRecording: false,
  isLoading: false,
  status: '',
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
    recorder.start()
  }
}
