import { store, toggleRecording, shareRecording } from './logic'
import { subscribe } from './store'

const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSf0G2ghmszoy7d54N2FasOMXqAJp2xKwxELO0EbRIZLXjqQCg/viewform?usp=pp_url&entry.366340186='

const recordBtn = document.getElementById('recordBtn') as HTMLButtonElement
const downloadBtn = document.getElementById('downloadBtn') as HTMLAnchorElement
const transcriptSection = document.getElementById('transcriptSection') as HTMLDivElement
const transcriptText = document.getElementById('transcriptText') as HTMLParagraphElement
const loadingIndicator = document.getElementById('loadingIndicator') as HTMLDivElement
const submitBtn = document.getElementById('submitBtn') as HTMLAnchorElement
const statusText = document.getElementById('statusText') as HTMLParagraphElement
const shareBtn = document.getElementById('shareBtn') as HTMLButtonElement
const sharedUrlSection = document.getElementById('sharedUrlSection') as HTMLDivElement
const sharedUrlText = document.getElementById('sharedUrlText') as HTMLParagraphElement
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement
const svgCopy = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
const svgTick = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`


subscribe(store, 'isRecording', value => {
  recordBtn.textContent = value ? 'Stop Recording' : 'Start Recording'
})

subscribe(store, 'status', value => {
  statusText.textContent = value
})

subscribe(store, 'isLoading', value => {
  loadingIndicator.style.display = value ? 'flex' : 'none'
})

subscribe(store, 'audioBlob', value => {
  if (value) {
    downloadBtn.href = URL.createObjectURL(value)
    downloadBtn.download = 'recording.webm'
    downloadBtn.style.display = 'inline-block'
    shareBtn.style.display = 'inline-block'
  } else {
    downloadBtn.style.display = 'none'
    shareBtn.style.display = 'none'
  }
})

subscribe(store, 'sharedAudioUrl', value => {
  if (value) {
    sharedUrlText.textContent = value
    sharedUrlSection.style.display = 'flex'
    copyBtn.innerHTML = svgCopy
  } else {
    sharedUrlSection.style.display = 'none'
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
shareBtn.addEventListener('click', shareRecording)
copyBtn.addEventListener('click', () => {
  if (!store.sharedAudioUrl) return
  navigator.clipboard.writeText(store.sharedAudioUrl)
  copyBtn.innerHTML = svgTick
})
