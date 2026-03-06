
# Running Pulumi on Google Cloud

* Create a Google Cloud Storage bucket to store the Pulumi state
* Install Google Cloud CLI: `brew install gcloud-cli`
* Log in to Google Cloud CLI: `gcloud auth application-default login`
* Log in with pulumi: `pulumi login gs://<bucket name>`
