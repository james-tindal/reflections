import * as gcp from '@pulumi/gcp'
import * as command from '@pulumi/command'
import { functionsBucket } from '@infra/buckets/functions'
import { region } from '@infra/config'
import paths from '@infra/utilities/paths'


const compile = new command.local.Command('compile-transcribe-function', {
  create: `npx tsc`,
  dir: paths.functions.transcribe,
  archivePaths: ['dist/**'],
})

const functionArchive = new gcp.storage.BucketObject('transcribe-function', {
  bucket: functionsBucket.name,
  name: 'transcribe.zip',
  source: compile.archive
})

export const fn = new gcp.cloudfunctions.Function('transcribe-fn', {
  runtime: 'nodejs24',
  region: region,
  sourceArchiveBucket: functionsBucket.name,
  sourceArchiveObject: functionArchive.name,
  entryPoint: 'handler',
  triggerHttp: true,
  availableMemoryMb: 512,
})

new gcp.cloudfunctions.FunctionIamMember('transcribe-fn-iam', {
  region: region,
  cloudFunction: fn.name,
  role: 'roles/cloudfunctions.invoker',
  member: 'allUsers'
})

export const transcribeUrl = fn.httpsTriggerUrl
