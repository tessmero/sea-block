/**
 * @file sound-asset-loader.ts
 *
 * Helper functions to preload and then lookup ogg assets.
 */
import { Howl } from 'howler'

// find public/sounds -type f | sed 's|^public/sounds/||;s|$|\",|;s|^|\"|'
export const SOUND_ASSET_URLS = [
  'chess/celebrate1.ogg',
  'chess/celebrate2.ogg',
  'chess/celebrate3.ogg',
  'chess/celebrate4.ogg',
  'chess/celebrate5.ogg',
  'chess/plonk1.ogg',
  'chess/plonk10.ogg',
  'chess/plonk2.ogg',
  'chess/plonk3.ogg',
  'chess/plonk4.ogg',
  'chess/plonk5.ogg',
  'chess/plonk6.ogg',
  'chess/plonk7.ogg',
  'chess/plonk8.ogg',
  'chess/plonk9.ogg',
  'chess/plonk9b.ogg',
  'kenney/click_005.ogg',
  'kenney/glass_005.ogg',
  'kenney/glass_006.ogg',
  'kenney/minimize_006.ogg',
  'kenney/select_001.ogg',
  'kenney/select_002.ogg',
  'kenney/select_003.ogg',
  'kenney/select_004.ogg',
] as const
export type SoundAssetUrl = (typeof SOUND_ASSET_URLS)[number]

const cache = new Map<SoundAssetUrl, Howl>()

export function getSound(url: SoundAssetUrl): Howl {
  return cache.get(url)
}

// called on startup
export async function loadAllSounds(): Promise<void> {
  SOUND_ASSET_URLS.map(async (sau) => {
    cache.set(sau, new Howl({
      src: [`sounds/${sau}`],
      format: ['ogg'],
    }))
  })
  await Promise.all(
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
