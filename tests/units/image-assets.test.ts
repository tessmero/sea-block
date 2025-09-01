/**
 * @file image-assets.test.ts
 *
 * Assert that all image asset URLs exist in public/images.
 */
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { IMAGE_ASSET_URLS } from '../../src/gfx/2d/image-asset-urls'

const PUBLIC_IMAGES_DIR = path.resolve(__dirname, '../../public/images')

describe('Image Assets', function () {
  for (const url of IMAGE_ASSET_URLS) {
    it(`exists: ${url}`, function () {
      const filePath = path.join(PUBLIC_IMAGES_DIR, url)
      assert.ok(fs.existsSync(filePath), `Missing image asset: ${filePath}`)
    })
  }
})
