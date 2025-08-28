/**
 * @file sounds-config.ts
 *
 * Config impelmentation with adjustable volume for each sound effect.
 */

import type { ConfigTree } from 'configs/config-tree'
import { Configurable } from 'configs/configurable'

// type SoundParams = {
//   src: Array<SoundAssetUrl>
//   volume: number
// }

// Separate object for sound sources only
export const SOUND_SOURCES = {
  hover: ['kenney/glass_005.ogg'],
  unhover: ['kenney/glass_006.ogg'],
  click: ['kenney/select_002.ogg'],
  unclick: ['kenney/select_001.ogg'],
  collapse: ['kenney/minimize_006.ogg'],

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
} as const

export type SoundEffectName = keyof typeof SOUND_SOURCES

const soundsConfigTree = {
  children: {
    'sound-hover': {
      label: 'hover',
      tooltip: JSON.stringify(SOUND_SOURCES.hover),
      value: 0.05,
      min: 0,
      max: 1,
      step: 0.01,
    },
    'sound-unhover': {
      label: 'unhover',
      tooltip: JSON.stringify(SOUND_SOURCES.unhover),
      value: 0.05,
      min: 0,
      max: 1,
      step: 0.01,
    },
    'sound-click': {
      label: 'click',
      tooltip: JSON.stringify(SOUND_SOURCES.click),
      value: 0.1,
      min: 0,
      max: 1,
      step: 0.01,
    },
    'sound-unclick': {
      label: 'unclick',
      tooltip: JSON.stringify(SOUND_SOURCES.unclick),
      value: 0.08,
      min: 0,
      max: 1,
      step: 0.01,
    },
    'sound-collapse': {
      label: 'collapse',
      tooltip: JSON.stringify(SOUND_SOURCES.collapse),
      value: 0.1,
      min: 0,
      max: 1,
      step: 0.01,
    },
    'sound-chessClick': {
      label: 'chessClick',
      tooltip: JSON.stringify(SOUND_SOURCES.chessClick),
      value: 0.2,
      min: 0,
      max: 1,
      step: 0.01,
    },
    'sound-chessCancel': {
      label: 'chessCancel',
      tooltip: JSON.stringify(SOUND_SOURCES.chessCancel),
      value: 0.08,
      min: 0,
      max: 1,
      step: 0.01,
    },
    'sound-chessLand': {
      label: 'chessLand',
      tooltip: JSON.stringify(SOUND_SOURCES.chessLand),
      value: 0.2,
      min: 0,
      max: 1,
      step: 0.01,
    },
    'sound-chessGoodCapture': {
      label: 'chessGoodCapture',
      tooltip: JSON.stringify(SOUND_SOURCES.chessGoodCapture),
      value: 0.2,
      min: 0,
      max: 1,
      step: 0.01,
    },
    'sound-chessBadCapture': {
      label: 'chessBadCapture',
      tooltip: JSON.stringify(SOUND_SOURCES.chessBadCapture),
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
    },
    'sound-chessJump': {
      label: 'chessJump',
      tooltip: JSON.stringify(SOUND_SOURCES.chessJump),
      value: 0.07,
      min: 0,
      max: 1,
      step: 0.01,
    },
    'sound-chessCelebrate': {
      label: 'chessCelebrate',
      tooltip: JSON.stringify(SOUND_SOURCES.chessCelebrate),
      value: 0.08,
      min: 0,
      max: 1,
      step: 0.01,
    },
  },
} satisfies ConfigTree

class SoundsConfig extends Configurable<typeof soundsConfigTree> {
  static { Configurable.register('sounds', () => new SoundsConfig()) }
  tree = soundsConfigTree
}
export const soundsConfig = Configurable.create('sounds') as SoundsConfig
