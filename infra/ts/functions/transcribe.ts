import * as gcp from '@pulumi/gcp'
import * as command from '@pulumi/command'
import { functionsBucket } from '@infra/buckets/functions'
import { region } from '@infra/config'
import paths from '@infra/utilities/paths'
import { gcpBuildService, gcpFunctionsService, gcpRunService } from './gcp-functions-service'
import { FolderHash } from '@infra/utilities/folder-hash'


const folderHash = new FolderHash('transcribe-fn-folder-hash', {
  path: paths.functions.transcribe,
  folders: { exclude: ['node_modules'] }
})

const build = new command.local.Command('build-transcribe-fn', {
  create: `pnpm install && pnpm rolldown -c`,
  dir: paths.functions.transcribe,
  triggers: [folderHash.hash]
})

const zip = new command.local.Command('zip-transcribe-fn', {
  create: '',
  dir: paths.functions.transcribe + '/dist',
  archivePaths: ['function.js'],
}, { dependsOn: [build] })

const bucketObject = new gcp.storage.BucketObject('transcribe-fn-object', {
  bucket: functionsBucket.name,
  name: 'function.zip',
  source: zip.archive,
})

new command.local.Command('cleanup-transcribe-fn', {
  create: `rm -rf dist`,
  dir: paths.functions.transcribe,
}, { dependsOn: [bucketObject] })

export const fn = new gcp.cloudfunctionsv2.Function('transcribe-fn', {
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
  },
}, { dependsOn: [gcpFunctionsService, gcpBuildService, gcpRunService] })

new gcp.cloudfunctionsv2.FunctionIamMember('transcribe-fn-iam', {
  location: region,
  cloudFunction: fn.name,
  role: 'roles/cloudfunctions.invoker',
  member: 'allUsers'
})

export const transcribeUrl = fn.serviceConfig.apply((sc) => sc?.uri)
