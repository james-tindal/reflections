import * as gcp from '@pulumi/gcp'
import * as command from '@pulumi/command'
import { functionsBucket } from '@infra/buckets/functions'
import { region } from '@infra/config'
import paths from '@infra/utilities/paths'
import { gcpBuildService, gcpFunctionsService, gcpRunService } from './gcp-functions-service'


const compile = new command.local.Command('compile-transcribe-function', {
  create: `tsc --noEmit false`,
  dir: paths.functions.transcribe,
  archivePaths: ['dist/**', 'package.json'],
})

const functionArchive = new gcp.storage.BucketObject('transcribe-function', {
  bucket: functionsBucket.name,
  name: 'transcribe.zip',
  source: compile.archive
})

export const fn = new gcp.cloudfunctionsv2.Function('transcribe-fn', {
  location: region,
  buildConfig: {
    runtime: 'nodejs24',
    entryPoint: 'handler',
    source: {
      storageSource: {
        bucket: functionsBucket.name,
        object: functionArchive.name,
      },
    },
  },
  serviceConfig: {
    availableMemory: '512M',
  },
}, { dependsOn: [gcpFunctionsService, gcpBuildService, gcpRunService] })

new gcp.cloudfunctionsv2.FunctionIamMember('transcribe-fn-iam', {
  location: region,
  cloudFunction: fn.name,
  role: 'roles/cloudfunctions.invoker',
  member: 'allUsers'
})

export const transcribeUrl = fn.serviceConfig.apply((sc) => sc?.uri)
