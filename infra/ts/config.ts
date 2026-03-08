import * as pulumi from '@pulumi/pulumi'

const config = new pulumi.Config()
export const region = config.get('region') || 'us-central1'
export const googleCloudProject = config.require('google-cloud-project')
