import * as gcp from '@pulumi/gcp'
import { region } from '@infra/config'

export const functionsBucket = new gcp.storage.Bucket('functions-archive', {
  location: region,
  uniformBucketLevelAccess: true
})
