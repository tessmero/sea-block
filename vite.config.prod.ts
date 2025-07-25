/**
 * @file vite.config.prod.ts
 *
 * The default vite build used for "npm run build:prod".
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
})
