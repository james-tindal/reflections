import { findUp } from 'find-up-simple'
import * as path from 'node:path'

const root = await findUp('pnpm-workspace.yaml')

if (!root)
  throw new Error('Could not find monorepo root')

const paths = {
  root,
  website: path.join(root, 'website'),
  functions: {
    transcribe: path.join(root, 'functions/transcribe'),
    uploadAudio: path.join(root, 'functions/upload-audio'),
  }
}

export default paths
