import * as gcp from '@pulumi/gcp'
import * as synced from '@pulumi/synced-folder'
import * as command from '@pulumi/command'

import paths from '@infra/utilities/paths'
import { region } from '@infra/config'
import { writeExports } from '@infra/utilities/write-exports'
import { transcribeUrl } from '@infra/functions/transcribe'
import { uploadAudioUrl, audioBucketUrl } from '@infra/functions/upload-audio'
import path from 'node:path'


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

export const websiteBuilt = new command.local.Command('compile-website', {
  create: `pnpm i -w ./api && cd ${paths.website} && npm run build`,
  dir: paths.root,
}, { dependsOn: [exportsWritten] })

const distPath = path.join(paths.website, 'dist')

new synced.GoogleCloudFolder('website-folder', {
  bucketName: websiteBucket.name,
  path: distPath,
  managedObjects: false,
}, { dependsOn: [websiteBuilt] })

export const websiteUrl = websiteBucket.name.apply(name => 
  `https://storage.googleapis.com/${name}`
)
