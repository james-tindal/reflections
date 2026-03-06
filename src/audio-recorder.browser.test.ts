import { test, expect } from 'vitest'
import { AudioRecorder } from './audio-recorder'

test('records audio', async () => {
  let capturedBlob: Blob | null = null

  const recorder = new AudioRecorder({
    error: err => { throw err },
    audio: blob => { capturedBlob = blob }
  })

  await recorder.start()
  await new Promise(r => setTimeout(r, 500))
  recorder.stop()
  await new Promise(r => setTimeout(r, 100))

  expect(capturedBlob).toBeInstanceOf(Blob)
  expect(capturedBlob!.size).toBeGreaterThan(0)
})
