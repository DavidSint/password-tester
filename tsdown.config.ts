import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./lib/index.ts'],
  dts: {
    sourcemap: true,
  },
  format: ['esm', 'cjs']
})
