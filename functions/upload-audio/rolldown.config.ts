import { defineConfig } from 'rolldown'

export default defineConfig({
  input: 'index.ts',
  output: {
    file: 'dist/function.js',
    format: 'cjs',
    platform: 'node',
  },
  external: [],
  target: 'node24',
})
