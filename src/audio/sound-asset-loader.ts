/**
 * @file sound-asset-loader.ts
 *
 * Helper functions to preload and then lookup ogg assets.
 */
import { Howl } from 'howler'
import type { SoundAssetUrl } from './sound-asset-urls'
import { SOUND_ASSET_URLS } from './sound-asset-urls'

const cache = new Map<SoundAssetUrl, Howl>()

export function getSound(url: SoundAssetUrl): Howl {
  return cache.get(url)
}

// called on startup
export async function loadAllSounds(): Promise<Array<void>> {
  SOUND_ASSET_URLS.map(async (sau) => {
    cache.set(sau, new Howl({
      src: [`sounds/${sau}`],
      format: ['ogg'],
    }))
  })
  return Promise.all(
    Object.values(cache).map(
      sound =>
        new Promise<void>((resolve, reject) => {
          const howl = sound as Howl
          howl.once('load', resolve)
          howl.once('loaderror', reject)
        }),
    ),
  )
}
