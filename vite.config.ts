import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

module.exports = defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'password-tester',
      fileName: (format) => `password-tester.${format}.js`
    }
  },
  plugins: [dts()]
})