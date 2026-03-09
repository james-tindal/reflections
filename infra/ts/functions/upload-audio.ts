import * as gcp from '@pulumi/gcp'
import * as command from '@pulumi/command'

import { functionsBucket } from '@infra/buckets/functions'
import { region } from '@infra/config'
import paths from '@infra/utilities/paths'
import { gcpBuildService, gcpFunctionsService, gcpRunService } from './gcp-functions-service'


export const compile = new command.local.Command('compile-upload-audio-function', {
  create: `tsc --noEmit false`,
  dir: paths.functions.uploadAudio,
  archivePaths: ['dist/**', 'package.json'],
})

const audioBucket = new gcp.storage.Bucket('audio-bucket', {
  location: region,
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

export const uploadAudioFn = new gcp.cloudfunctionsv2.Function('upload-audio-fn', {
  location: region,
  buildConfig: {
    runtime: 'nodejs24',
    entryPoint: 'handler',
    source: {
      storageSource: {
        bucket: functionsBucket.name,
        object: uploadAudioFunctionArchive.name,
      },
    },
  },
  serviceConfig: {
    availableMemory: '256M',
    environmentVariables: {
      AUDIO_BUCKET: audioBucket.name
    },
  },
}, { dependsOn: [gcpFunctionsService, gcpBuildService, gcpRunService] })

new gcp.cloudfunctionsv2.FunctionIamMember('upload-audio-fn-iam', {
  location: region,
  cloudFunction: uploadAudioFn.name,
  role: 'roles/cloudfunctions.invoker',
  member: 'allUsers'
})

export const uploadAudioUrl = uploadAudioFn.serviceConfig.apply(sc => sc?.uri)
export const audioBucketName = audioBucket.name
export const audioBucketUrl = `https://storage.googleapis.com/${audioBucket.name}`
