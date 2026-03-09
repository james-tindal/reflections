import * as gcp from '@pulumi/gcp'

export const gcpFunctionsService = new gcp.projects.Service('cloudfunctions-api', {
  service: 'cloudfunctions.googleapis.com',
  disableOnDestroy: false,
})

export const gcpBuildService = new gcp.projects.Service('cloudbuild-api', {
  service: 'cloudbuild.googleapis.com',
  disableOnDestroy: false,
})

export const gcpRunService = new gcp.projects.Service('cloud-run-api', {
  service: 'run.googleapis.com',
  disableOnDestroy: false,
})
