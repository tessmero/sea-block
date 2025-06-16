import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    watch: {
      chokidar: {
        usePolling: true,
        interval: 1000,
      },
    },
    minify: false,
    terserOptions: {
      mangle: false,
      compress: false,
    },
  },
})
