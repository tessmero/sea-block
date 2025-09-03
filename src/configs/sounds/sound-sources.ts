/**
 * @file sound-sources.ts
 *
 * Defines enabled sound effect names and maps them to sound assets.
 */

import type { SoundAssetUrl } from 'audio/sound-asset-urls'

// Separate object for sound sources only
export const SOUND_SOURCES = {

  hover: ['kenney/glass_005.ogg'],
  unhover: ['kenney/glass_006.ogg'],
  click: ['kenney/select_002.ogg'],
  unclick: ['kenney/select_001.ogg'],
  collapse: ['kenney/minimize_006.ogg'],

  smStart: [
    // 'kenney/confirmation_001.ogg',
    'kenney/confirmation_002.ogg',
    // 'kenney/confirmation_003.ogg',
    // 'kenney/confirmation_004.ogg',
  ],

  smNav: ['kenney/drop_001.ogg'],
  settingsOpen: ['kenney/maximize_006.ogg'],
  settingsClose: ['kenney/drop_004.ogg'],

  chessClick: ['kenney/click_002.ogg'],
  chessCancel: ['kenney/error_004.ogg'],
  chessLand: [
    'kenney/impactWood_medium_000.ogg',
    'kenney/impactWood_medium_001.ogg',
    'kenney/impactWood_medium_002.ogg',
    'kenney/impactWood_medium_003.ogg',
    'kenney/impactWood_medium_004.ogg',
  ],
  chessGoodCapture: ['kenney/select_006.ogg'],
  chessBadCapture: ['kenney/error_005.ogg'],
  // chessConfirm: ['kenney/glass_005.ogg'],

  chessJump: [
    'kenney/drop_001.ogg',
  ],

  chessCelebrate: [
    'chess/celebrate1.ogg',
    'chess/celebrate2.ogg',
    'chess/celebrate3.ogg',
    'chess/celebrate4.ogg',
    'chess/celebrate5.ogg',
  ],
} as const satisfies Record<string, Array<SoundAssetUrl>>
export type SoundEffectName = keyof typeof SOUND_SOURCES

// if (isDevMode) {
// // render .gitignore to track only necessary oggs
//   const oggFiles = Array.from(
//     new Set(
//       Object.values(SOUND_SOURCES)
//         .flat()
//         .filter(f => typeof f === 'string' && f.endsWith('.ogg')),
//     ),
//   )
//   const result: Array<string> = []
//   result.push('# .gitignore to only track sounds used in SOUND_SOURCES')
//   result.push('**/*.ogg')
//   oggFiles.forEach(file => result.push(`!${file}`))
//   console.log(result.join('\n'))
// }
