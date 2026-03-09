import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { execSync } from 'node:child_process'

import paths from '@infra/utilities/paths'
import { region } from '@infra/config'
import { writeExports } from '@infra/utilities/write-exports'
import { transcribeUrl } from '@infra/functions/transcribe'
import { uploadAudioUrl, audioBucketUrl } from '@infra/functions/upload-audio'
import { OutputResource } from '@infra/utilities/output-resource'


export const websiteBucket = new gcp.storage.Bucket('website', {
  location: region,
  uniformBucketLevelAccess: true,
  website: {
    mainPageSuffix: 'index.html',
    notFoundPage: '404.html'
  }
})

new gcp.storage.BucketAccessControl('website-bucket-owner', {
  bucket: websiteBucket.name,
  role: 'OWNER',
  entity: 'allUsers'
})

const exportsWritten = writeExports('api', {
  transcribeUrl,
  uploadAudioUrl,
  audioBucketUrl
})

const websiteBuilt = new OutputResource(
  exportsWritten.apply(() =>
    execSync(`pnpm i -w ./api && cd ${paths.website} && npm run build`)))

const distPath = path.join(paths.website, 'dist')

function getFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = entries.map(entry => {
    const fullPath = path.join(dir, entry.name)
    return entry.isDirectory() ? getFiles(fullPath) : fullPath
  })
  return files.flat()
}

const files = getFiles(distPath)

const websiteObjects = files.map(file => {
  const relativePath = path.relative(distPath, file)
  return new gcp.storage.BucketObject(`website-${relativePath.replace(/[\/\\]/g, '-')}`, {
    bucket: websiteBucket.name,
    name: relativePath,
    source: new pulumi.asset.FileAsset(file)
  }, { dependsOn: [websiteBuilt] })
})

export const websiteUrl = websiteBucket.name.apply(name => 
  `https://storage.googleapis.com/${name}`
)
