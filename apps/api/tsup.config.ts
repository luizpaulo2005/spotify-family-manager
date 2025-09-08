import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  splitting: false,
  format: ['esm'],
  sourcemap: true,
  clean: true,
  noExternal: ['@spotify-family-manager/env'],
})
