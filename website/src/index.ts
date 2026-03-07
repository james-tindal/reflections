import { AudioRecorder } from './audio-recorder'
import { Store } from './store'
import { transcribeAudio } from './transcribe'

const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSf0G2ghmszoy7d54N2FasOMXqAJp2xKwxELO0EbRIZLXjqQCg/viewform?usp=pp_url&entry.366340186='

const store = Store({
  isRecording: false,
  audioBlob: undefined as Blob | undefined,
  transcript: undefined as string | undefined
})

const recordBtn = document.getElementById('recordBtn') as HTMLButtonElement
const downloadBtn = document.getElementById('downloadBtn') as HTMLAnchorElement
const transcriptSection = document.getElementById('transcriptSection') as HTMLDivElement
const transcriptText = document.getElementById('transcriptText') as HTMLParagraphElement
const loadingIndicator = document.getElementById('loadingIndicator') as HTMLDivElement
const submitBtn = document.getElementById('submitBtn') as HTMLAnchorElement
const statusText = document.getElementById('statusText') as HTMLParagraphElement

const recorder = new AudioRecorder({
  error: (err) => {
    statusText.textContent = `Error: ${err.message}`
    stopRecording()
  },
  audio: async (blob) => {
    store.audioBlob = blob
    
    downloadBtn.href = URL.createObjectURL(blob)
    downloadBtn.download = 'recording.webm'
    downloadBtn.style.display = 'inline-block'
    
    statusText.textContent = 'Transcribing...'
    loadingIndicator.style.display = 'block'
    transcriptSection.style.display = 'none'
    submitBtn.style.display = 'none'
    
    try {
      store.transcript = await transcribeAudio(blob)
      
      loadingIndicator.style.display = 'none'
      transcriptSection.style.display = 'block'
      transcriptText.textContent = store.transcript
      
      submitBtn.href = formUrl + encodeURIComponent(store.transcript)
      submitBtn.style.display = 'inline-block'
      
      statusText.textContent = 'Done!'
    } catch (err) {
      loadingIndicator.style.display = 'none'
      statusText.textContent = `Transcription failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
    
    stopRecording()
  }
})

recordBtn.addEventListener('click', () => {
  if (store.isRecording)
    recorder.stop()
  else
    startRecording()
})

function startRecording() {
  store.isRecording = true
  recordBtn.textContent = 'Stop Recording'
  statusText.textContent = 'Recording...'
  downloadBtn.style.display = 'none'
  transcriptSection.style.display = 'none'
  submitBtn.style.display = 'none'
  store.audioBlob = undefined
  store.transcript = undefined
  recorder.start()
}

function stopRecording() {
  store.isRecording = false
  recordBtn.textContent = 'Start Recording'
}
