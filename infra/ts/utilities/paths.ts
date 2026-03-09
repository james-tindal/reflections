import { findUp } from 'find-up-simple'
import * as path from 'node:path'

const pnpmYaml = await findUp('pnpm-workspace.yaml')

if (!pnpmYaml)
  throw new Error('Could not find monorepo root')

const root = path.join(pnpmYaml, '..')
const paths = {
  root,
  website: path.join(root, 'website'),
  functions: {
    transcribe: path.join(root, 'functions/transcribe'),
    uploadAudio: path.join(root, 'functions/upload-audio'),
  }
}

export default paths
