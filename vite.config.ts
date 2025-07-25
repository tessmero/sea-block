/**
 * @file vite.config.ts
 *
 * Configuration for vite build used in "npm run dev".
 */

import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import json5Plugin from 'vite-plugin-json5'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    json5Plugin(),
  ],
  base: './',
  build: {

    // use polling instead of intended vite watch
    watch: {
      chokidar: {
        usePolling: true,
        interval: 1000,
      },
    },

    // keep output readable in browser debugger
    minify: false,
    terserOptions: {
      mangle: false,
      compress: false,
    },
  },
})
