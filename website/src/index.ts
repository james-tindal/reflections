import { AudioRecorder } from './audio-recorder'
import { transcribeAudio } from './transcribe'

const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSf0G2ghmszoy7d54N2FasOMXqAJp2xKwxELO0EbRIZLXjqQCg/viewform?usp=pp_url&entry.366340186='

let isRecording = false
let audioBlob: Blob | null = null
let currentTranscript: string | null = null

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
    stopRecordingState()
  },
  audio: async (blob) => {
    audioBlob = blob
    statusText.textContent = 'Transcribing...'
    
    try {
      loadingIndicator.style.display = 'block'
      transcriptSection.style.display = 'none'
      
      currentTranscript = await transcribeAudio(blob)
      
      loadingIndicator.style.display = 'none'
      transcriptSection.style.display = 'block'
      transcriptText.textContent = currentTranscript
      
      downloadBtn.style.display = 'inline-block'
      downloadBtn.href = URL.createObjectURL(blob)
      downloadBtn.download = 'recording.webm'
      
      submitBtn.href = formUrl + encodeURIComponent(currentTranscript)
      submitBtn.style.display = 'inline-block'
      
      statusText.textContent = 'Done!'
    } catch (err) {
      loadingIndicator.style.display = 'none'
      statusText.textContent = `Transcription failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
    
    stopRecordingState()
  }
})

recordBtn.addEventListener('click', () => {
  if (isRecording)
    recorder.stop()
  else
    startRecording()
})

function startRecording() {
  isRecording = true
  recordBtn.textContent = 'Stop Recording'
  statusText.textContent = 'Recording...'
  downloadBtn.style.display = 'none'
  transcriptSection.style.display = 'none'
  submitBtn.style.display = 'none'
  audioBlob = null
  currentTranscript = null
  recorder.start()
}

function stopRecordingState() {
  isRecording = false
  recordBtn.textContent = 'Start Recording'
}
