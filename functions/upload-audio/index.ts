import { Storage } from '@google-cloud/storage'

const storage = new Storage()
const bucketName = 'reflection-audio'
const bucket = storage.bucket(bucketName)

function generateFilename(contentType: string): string {
  const ext = contentType.split('/')[1] || 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}.${ext}`
}

interface HttpRequest {
  method?: string
  headers?: Record<string, string>
  body?: Buffer
}

export async function handler(
  req: HttpRequest,
  res: { 
    status: (code: number) => { json: (data: unknown) => void }
  }
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const contentType = req.headers?.['content-type'] || 'application/octet-stream'
  const filename = generateFilename(contentType)
  const file = bucket.file(filename)

  await file.save(req.body, {
    contentType,
    metadata: {
      cacheControl: 'public, max-age=31536000'
    }
  })

  const url = `https://storage.googleapis.com/${bucketName}/${filename}`
  res.status(200).json({ url })
}
