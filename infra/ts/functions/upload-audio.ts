import * as gcp from '@pulumi/gcp'
import * as command from '@pulumi/command'

import { functionsBucket } from '@infra/buckets/functions'
import { region } from '@infra/config'
import paths from '@infra/utilities/paths'


export const compile = new command.local.Command('compile-upload-audio-function', {
  create: `npx tsc`,
  dir: paths.functions.transcribe,
  archivePaths: ['dist/**'],
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

const uploadAudioFunctionArchive = new gcp.storage.BucketObject('upload-audio-function-archive', {
  bucket: functionsBucket.name,
  name: 'upload-audio.zip',
  source: compile.archive
})

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
  region: region,
  cloudFunction: uploadAudioFn.name,
  role: 'roles/cloudfunctions.invoker',
  member: 'allUsers'
})

export const uploadAudioUrl = uploadAudioFn.httpsTriggerUrl
export const audioBucketName = audioBucket.name
export const audioBucketUrl = `https://storage.googleapis.com/${audioBucket.name}`
