/**
 * @file vite.config.prod.ts
 *
 * The default vite build used for "npm run build:prod".
 */
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  base: './',
})
