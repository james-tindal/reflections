import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'

const config = new pulumi.Config()
const project = config.require('project')
const region = config.get('region') || 'us-central1'

const bucket = new gcp.storage.Bucket('transcribe-function-bucket', {
  location: region,
  uniformBucketLevelAccess: true
})

const functionArchive = new gcp.storage.BucketObject('function-archive', {
  bucket: bucket.name,
  name: 'function.zip',
  source: new pulumi.asset.FileArchive('../functions/transcribe')
})

const fn = new gcp.cloudfunctions.Function('transcribe-fn', {
  runtime: 'nodejs24',
  region: region,
  sourceArchiveBucket: bucket.name,
  sourceArchiveObject: functionArchive.name,
  entryPoint: 'handler',
  triggerHttp: true,
  availableMemoryMb: 512,
  environmentVariables: {
    GOOGLE_CLOUD_PROJECT: project
  }
})

const iam = new gcp.cloudfunctions.FunctionIamMember('transcribe-fn-iam', {
  project: project,
  region: region,
  cloudFunction: fn.name,
  role: 'roles/cloudfunctions.invoker',
  member: 'allUsers'
})

export const functionUrl = fn.httpsTriggerUrl
