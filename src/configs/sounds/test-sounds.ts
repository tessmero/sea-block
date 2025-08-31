/**
 * @file test-sounds.ts
 *
 * Config items to play any available sound asset.
 */

import { getSound } from 'audio/sound-asset-loader'
import { SOUND_ASSET_URLS } from 'audio/sound-asset-urls'

// Group sources by prefix before first slash
function getCategory(url: string) {
  const idx = url.indexOf('/')
  return idx === -1 ? 'misc' : url.slice(0, idx)
}

export const testSoundSources = Object.fromEntries(
  SOUND_ASSET_URLS.map(url => [url.replace(/[./]/g, '_'), [url]]),
)

export const testConfigItemsByCategory = SOUND_ASSET_URLS.reduce((acc, url) => {
  const cat = getCategory(url)
  if (!acc[cat]) acc[cat] = {}
  acc[cat][`sound-${url.replace(/[./]/g, '_')}`] = {
    label: url,
    action: () => {
      // test sound
      const howl = getSound(url)
      howl.play()
    },
    // tooltip: JSON.stringify([url]),
    // value: 0.1,
    // min: 0,
    // max: 1,
    // step: 0.01,
  }
  return acc
}, {} as Record<string, Record<string, any>>) // eslint-disable-line @typescript-eslint/no-explicit-any

export const testConfigItems = Object.fromEntries(
  Object.entries(testConfigItemsByCategory)
    .map(
      ([category, items]) => [
        category, {
          children: items,
        },
      ],
    ),
)
