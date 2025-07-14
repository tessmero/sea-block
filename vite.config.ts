/**
 * @file vite.config.ts
 *
 * Configuration for vite build used in "npm run dev".
 */

import { defineConfig } from 'vite'

export default defineConfig({
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
