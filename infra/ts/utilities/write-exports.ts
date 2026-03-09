import * as pulumi from '@pulumi/pulumi'
import * as path from 'node:path'
import * as local from '@pulumi/local'
import paths from './paths'


function objectToTypescript(obj: Record<string, unknown>) {
  const lines = Object.entries(obj).map(
    ([key, value]) => `export const ${key} = ${JSON.stringify(value)}`
  )
  return lines.join('\n') + '\n'
}

/**
 * Write a `pulumi-output.ts` file at the given path that exports the given key-value pairs with Pulumi Outputs resolved.
 * Path relative to the monorepo root (where pnpm-workspace.yaml lives).
 */
export function writeExports(folderPath: string, obj: Record<string, unknown>) {
  const filePath = path.join(paths.root, folderPath, 'pulumi-output.ts')

  const safePath = folderPath.replace(/[\/\\]/g, '-')
  return new local.File(`write-exports-${safePath}`, {
    filename: filePath,
    content: pulumi.all(obj).apply(objectToTypescript),
  })
}
