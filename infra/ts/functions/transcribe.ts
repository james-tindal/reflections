import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import * as command from '@pulumi/command'
import * as path from 'node:path'
import { functionsBucket } from '@infra/buckets/functions'
import { googleCloudProject, region } from '@infra/config'
import paths from '@infra/utilities/paths'


export const compile = new command.local.Command('compile-transcribe-function', {
  create: `cd ${paths.functions.transcribe} && npx tsc`
})

const functionArchive = new gcp.storage.BucketObject('transcribe-function', {
  bucket: functionsBucket.name,
  name: 'transcribe.zip',
  source: new pulumi.asset.FileArchive(path.join(paths.functions.transcribe, 'dist'))
}, { dependsOn: [compile] })

export const fn = new gcp.cloudfunctions.Function('transcribe-fn', {
  runtime: 'nodejs24',
  region: region,
  sourceArchiveBucket: functionsBucket.name,
  sourceArchiveObject: functionArchive.name,
  entryPoint: 'handler',
  triggerHttp: true,
  availableMemoryMb: 512,
  environmentVariables: {
    GOOGLE_CLOUD_PROJECT: googleCloudProject
  }
})

new gcp.cloudfunctions.FunctionIamMember('transcribe-fn-iam', {
  project: googleCloudProject,
  region: region,
  cloudFunction: fn.name,
  role: 'roles/cloudfunctions.invoker',
  member: 'allUsers'
})

export const transcribeUrl = fn.httpsTriggerUrl
