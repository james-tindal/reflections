import * as gcp from '@pulumi/gcp'
import { region } from '@infra/config'

export const audioBucket = new gcp.storage.Bucket('audio-bucket', {
  location: region,
})

new gcp.storage.BucketAccessControl('audio-bucket-owner', {
  bucket: audioBucket.name,
  role: 'OWNER',
  entity: 'allUsers'
})
