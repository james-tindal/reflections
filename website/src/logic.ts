import { UiState } from '.'
import { AudioRecorder } from './audio-recorder'
import { transcribeAudio } from './transcribe'

export function Logic (store: UiState) {
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
  function toggleRecording() {
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
  return { toggleRecording }
}
