import * as gcp from '@pulumi/gcp'
import * as command from '@pulumi/command'
import { functionsBucket } from '@infra/buckets/functions'
import { region } from '@infra/config'
import paths from '@infra/utilities/paths'
import { gcpBuildService, gcpFunctionsService, gcpRunService } from './gcp-functions-service'
import { audioBucket } from '@infra/buckets/audio'
import { FolderHash } from '@infra/utilities/folder-hash'


const folderHash = new FolderHash('upload-audio-fn-folder-hash', {
  path: paths.functions.uploadAudio,
  folders: { exclude: ['node_modules'] }
})

const build = new command.local.Command('build-upload-audio-fn', {
  create: `pnpm install && pnpm rolldown -c`,
  dir: paths.functions.uploadAudio,
  triggers: [folderHash.hash]
})

const zip = new command.local.Command('zip-upload-audio-fn', {
  create: '',
  dir: paths.functions.uploadAudio + '/dist',
  archivePaths: ['function.js'],
}, { dependsOn: [build] })

const bucketObject = new gcp.storage.BucketObject('upload-audio-fn-object', {
  bucket: functionsBucket.name,
  name: 'function.zip',
  source: zip.archive,
})

new command.local.Command('cleanup-upload-audio-fn', {
  create: `rm -rf dist`,
  dir: paths.functions.uploadAudio,
}, { dependsOn: [bucketObject] })

export const fn = new gcp.cloudfunctionsv2.Function('upload-audio-fn', {
  location: region,
  buildConfig: {
    runtime: 'nodejs24',
    entryPoint: 'handler',
    source: {
      storageSource: {
        bucket: functionsBucket.name,
        object: bucketObject.name,
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
  cloudFunction: fn.name,
  role: 'roles/cloudfunctions.invoker',
  member: 'allUsers'
})

export const uploadAudioUrl = fn.serviceConfig.apply(sc => sc?.uri)
export const audioBucketName = audioBucket.name
export const audioBucketUrl = `https://storage.googleapis.com/${audioBucket.name}`
