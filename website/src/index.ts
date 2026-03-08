import { store, toggleRecording } from './logic'
import { subscribe } from './store'

const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSf0G2ghmszoy7d54N2FasOMXqAJp2xKwxELO0EbRIZLXjqQCg/viewform?usp=pp_url&entry.366340186='

const recordBtn = document.getElementById('recordBtn') as HTMLButtonElement
const downloadBtn = document.getElementById('downloadBtn') as HTMLAnchorElement
const transcriptSection = document.getElementById('transcriptSection') as HTMLDivElement
const transcriptText = document.getElementById('transcriptText') as HTMLParagraphElement
const loadingIndicator = document.getElementById('loadingIndicator') as HTMLDivElement
const submitBtn = document.getElementById('submitBtn') as HTMLAnchorElement
const statusText = document.getElementById('statusText') as HTMLParagraphElement

subscribe(store, 'isRecording', value => {
  recordBtn.textContent = value ? 'Stop Recording' : 'Start Recording'
})

subscribe(store, 'status', value => {
  statusText.textContent = value
})

subscribe(store, 'isLoading', value => {
  loadingIndicator.style.display = value ? 'block' : 'none'
})

subscribe(store, 'audioBlob', value => {
  if (value) {
    downloadBtn.href = URL.createObjectURL(value)
    downloadBtn.download = 'recording.webm'
    downloadBtn.style.display = 'inline-block'
  } else {
    downloadBtn.style.display = 'none'
  }
})

subscribe(store, 'transcript', value => {
  if (value) {
    transcriptText.textContent = value
    transcriptSection.style.display = 'block'
    submitBtn.href = formUrl + encodeURIComponent(value)
    submitBtn.style.display = 'inline-block'
  } else {
    transcriptSection.style.display = 'none'
    submitBtn.style.display = 'none'
  }
})


recordBtn.addEventListener('click', toggleRecording)
