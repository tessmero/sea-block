/**
 * @file mesh-assets.test.ts
 *
 * Assert that all mesh asset URLs exist in public/obj.
 */
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { MESH_ASSET_URLS } from '../../src/gfx/3d/mesh-asset-loader'

const PUBLIC_OBJ_DIR = path.resolve(__dirname, '../../public/obj')

describe('Mesh Assets', function () {
  for (const url of MESH_ASSET_URLS) {
    it(`exists: ${url}`, function () {
      const filePath = path.join(PUBLIC_OBJ_DIR, url)
      assert.ok(fs.existsSync(filePath), `Missing mesh asset: ${filePath}`)
    })
  }
})
