import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import * as command from '@pulumi/command'
import * as path from 'node:path'

import { functionsBucket } from '@infra/buckets/functions'
import { googleCloudProject, region } from '@infra/config'
import paths from '@infra/utilities/paths'


export const compile = new command.local.Command('compile-upload-audio-function', {
  create: `cd ${paths.functions.uploadAudio} && npx tsc`
})

const audioBucket = new gcp.storage.Bucket('upload-audio', {
  location: region,
  uniformBucketLevelAccess: true
})

new gcp.storage.BucketAccessControl('audio-bucket-owner', {
  bucket: audioBucket.name,
  role: 'OWNER',
  entity: 'allUsers'
})

const distPath = path.join(paths.functions.uploadAudio, 'dist')
const uploadAudioFunctionArchive = new gcp.storage.BucketObject('upload-audio-function-archive', {
  bucket: functionsBucket.name,
  name: 'upload-audio.zip',
  source: new pulumi.asset.FileArchive(distPath)
}, { dependsOn: [compile] })

export const uploadAudioFn = new gcp.cloudfunctions.Function('upload-audio-fn', {
  runtime: 'nodejs24',
  region: region,
  sourceArchiveBucket: functionsBucket.name,
  sourceArchiveObject: uploadAudioFunctionArchive.name,
  entryPoint: 'handler',
  triggerHttp: true,
  availableMemoryMb: 256,
  environmentVariables: {
    AUDIO_BUCKET: audioBucket.name
  }
})

new gcp.cloudfunctions.FunctionIamMember('upload-audio-fn-iam', {
  project: googleCloudProject,
  region: region,
  cloudFunction: uploadAudioFn.name,
  role: 'roles/cloudfunctions.invoker',
  member: 'allUsers'
})

export const uploadAudioUrl = uploadAudioFn.httpsTriggerUrl
export const audioBucketName = audioBucket.name
export const audioBucketUrl = `https://storage.googleapis.com/${audioBucket.name}`
