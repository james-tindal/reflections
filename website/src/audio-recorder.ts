
type Capabilities = {
  error: (err: Error) => void
  audio: (blob: Blob) => void
}

type Config = {
  maxDuration?: number
}

const defaultMaxDuration = 60_000

const Timeout = (callback: TimerHandler, duration?: number, ...args: unknown[]) => {
  const timerId = window.setTimeout(callback, duration, ...args)
  return {
    dispose() { window.clearTimeout(timerId) }
  }
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private caps: Capabilities
  private stream: MediaStream | null = null
  private timeout: { dispose(): void } | null = null
  private config: Config

  constructor(caps: Capabilities, config: Config = {}) {
    this.caps = caps
    this.config = config
    this.config.maxDuration ??= defaultMaxDuration
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.chunks = []
      this.mediaRecorder = new MediaRecorder(this.stream)

      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0)
          this.chunks.push(event.data)
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' })
        this.caps.audio(blob)
        this.cleanup()
      }

      this.mediaRecorder.onerror = () => {
        this.caps.error(new Error('Recording failed'))
        this.cleanup()
      }

      this.mediaRecorder.start()

      this.timeout = Timeout(() => this.stop(), this.config.maxDuration)
    } catch (err) {
      this.caps.error(err instanceof Error ? err : new Error(String(err)))
    }
  }

  stop() {
    if (this.timeout) {
      this.timeout.dispose()
      this.timeout = null
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive')
      this.mediaRecorder.stop()
  }

  private cleanup() {
    if (this.timeout) {
      this.timeout.dispose()
      this.timeout = null
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    this.mediaRecorder = null
  }
}

export type { Capabilities, Config }
