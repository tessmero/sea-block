/**
 * @file sound-assets.test.ts
 *
 * Assert that all sound asset URLs used in SOUND_SOURCES exist in public/sounds.
 */
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { SOUND_SOURCES } from '../../src/configs/sounds/sound-sources'

const PUBLIC_SOUNDS_DIR = path.resolve(__dirname, '../../public/sounds')

// Gather all unique sound asset URLs from SOUND_SOURCES
const soundAssetUrls = Array.from(
  new Set(
    Object.values(SOUND_SOURCES).flat(),
  ),
)

describe('Sound Assets', function () {
  for (const url of soundAssetUrls) {
    it(`exists: ${url}`, function () {
      const filePath = path.join(PUBLIC_SOUNDS_DIR, url)
      assert.ok(fs.existsSync(filePath), `Missing sound asset: ${filePath}`)
    })
  }
})
