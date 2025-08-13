/**
 * @file sound-asset-loader.ts
 *
 * Helper functions to preload and then lookup ogg assets.
 */
import { Howl } from 'howler'

// find public/sounds -type f | sed 's|^public/sounds/||;s|$|\",|;s|^|\"|'
export const SOUND_ASSET_URLS = [
  // kenney/back_001.ogg,
  // kenney/back_002.ogg,
  // kenney/back_003.ogg,
  // kenney/back_004.ogg,
  // kenney/bong_001.ogg,
  'chess/celebrate1.ogg',
  'chess/celebrate2.ogg',
  'chess/celebrate3.ogg',
  'chess/celebrate4.ogg',
  'chess/celebrate5.ogg',
  'kenney/click_002.ogg',
  // kenney/click_001.ogg,
  // kenney/click_003.ogg,
  // kenney/click_004.ogg,
  // kenney/click_005.ogg,
  // kenney/close_001.ogg,
  // kenney/close_002.ogg,
  // kenney/close_003.ogg,
  // kenney/close_004.ogg,
  'kenney/drop_001.ogg',
  // kenney/drop_002.ogg,
  // kenney/drop_003.ogg,
  // kenney/drop_004.ogg,
  'kenney/error_004.ogg',
  'kenney/error_005.ogg',
  // kenney/error_001.ogg,
  // kenney/error_002.ogg,
  // kenney/error_003.ogg,
  // kenney/error_006.ogg,
  // kenney/error_007.ogg,
  // kenney/error_008.ogg,
  'kenney/glass_005.ogg',
  'kenney/glass_006.ogg',
  // kenney/glass_001.ogg,
  // kenney/glass_002.ogg,
  // kenney/glass_003.ogg,
  // kenney/glass_004.ogg,
  'kenney/impactWood_medium_000.ogg',
  'kenney/impactWood_medium_001.ogg',
  'kenney/impactWood_medium_002.ogg',
  'kenney/impactWood_medium_003.ogg',
  'kenney/impactWood_medium_004.ogg',
  'kenney/minimize_006.ogg',
  // kenney/minimize_001.ogg,
  // kenney/minimize_002.ogg,
  // kenney/minimize_003.ogg,
  // kenney/minimize_004.ogg,
  // kenney/minimize_005.ogg,
  // kenney/minimize_007.ogg,
  // kenney/minimize_008.ogg,
  // kenney/minimize_009.ogg,
  // kenney/maximize_001.ogg,
  // kenney/maximize_002.ogg,
  // kenney/maximize_003.ogg,
  // kenney/maximize_004.ogg,
  // kenney/maximize_005.ogg,
  // kenney/maximize_006.ogg,
  // kenney/maximize_007.ogg,
  // kenney/maximize_008.ogg,
  // kenney/maximize_009.ogg,
  // kenney/open_001.ogg,
  // kenney/open_002.ogg,
  // kenney/open_003.ogg,
  // kenney/open_004.ogg,
  // kenney/pluck_001.ogg,
  // kenney/pluck_002.ogg,
  // kenney/question_001.ogg,
  // kenney/question_002.ogg,
  // kenney/question_003.ogg,
  // kenney/question_004.ogg,
  'kenney/select_001.ogg',
  'kenney/select_002.ogg',
  'kenney/select_006.ogg',
  // kenney/select_003.ogg,
  // kenney/select_004.ogg,
  // kenney/select_005.ogg,
  // kenney/select_007.ogg,
  // kenney/select_008.ogg,
  // kenney/scratch_001.ogg,
  // kenney/scratch_002.ogg,
  // kenney/scratch_003.ogg,
  // kenney/scratch_004.ogg,
  // kenney/scratch_005.ogg,
  // kenney/scroll_001.ogg,
  // kenney/scroll_002.ogg,
  // kenney/scroll_003.ogg,
  // kenney/scroll_004.ogg,
  // kenney/scroll_005.ogg,
  // kenney/switch_001.ogg,
  // kenney/switch_002.ogg,
  // kenney/switch_003.ogg,
  // kenney/switch_004.ogg,
  // kenney/switch_005.ogg,
  // kenney/switch_006.ogg,
  // kenney/switch_007.ogg,
  // kenney/tick_001.ogg,
  // kenney/tick_002.ogg,
  // kenney/tick_004.ogg,
  // kenney/toggle_001.ogg,
  // kenney/toggle_002.ogg,
  // kenney/toggle_003.ogg,
  // kenney/toggle_004.ogg,
  // kenney/confirmation_001.ogg,
  // kenney/confirmation_002.ogg,
  // kenney/confirmation_003.ogg,
  // kenney/confirmation_004.ogg,
  // kenney/glitch_001.ogg,
  // kenney/glitch_002.ogg,
  // kenney/glitch_003.ogg,
  // kenney/glitch_004.ogg,
] as const
export type SoundAssetUrl = (typeof SOUND_ASSET_URLS)[number]

const cache = new Map<SoundAssetUrl, Howl>()

export function getSound(url: SoundAssetUrl): Howl {
  return cache.get(url)
}

// called on startup
export async function loadAllSounds(): Promise<void[]> {
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
