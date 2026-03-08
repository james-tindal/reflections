import * as pulumi from '@pulumi/pulumi'
import * as fs from 'node:fs'
import * as path from 'node:path'
import paths from './paths'

async function writeExportsSimple(relativePath: string, obj: Record<string, unknown>) {
  const filePath = path.join(paths.root, relativePath)
  const dir = path.dirname(filePath)

  if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true })

  const content = `export default ${JSON.stringify(obj, null, 2)}\n`
  fs.writeFileSync(filePath, content)
}

/**
 * Write a `pulumi-exports.ts` file at the given path that exports the given object with Pulumi Outputs resolved.
 * Takes an object whose values can be plain values or Pulumi Outputs.
 * Path relative to the monorepo root (where pnpm-workspace.yaml lives).
 */
export function writeExports(
  folderPath: string,
  obj: Record<string, unknown>,
) {
  const filePath = path.join(folderPath, 'pulumi-output.ts')
  return pulumi.all(obj).apply(data => writeExportsSimple(filePath, data))
}
