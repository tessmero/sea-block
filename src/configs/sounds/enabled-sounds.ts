/**
 * @file enabled-sounds.ts
 *
 * Explicit config items for sounds that are included in production build.
 */

import type { Snapshot } from 'util/config-snapshot-helper'
import type { SoundEffectName } from './sound-sources'
import type { NumericItem } from 'configs/config-tree'

// called by button in topConfig, snapshot tweaked levels to paste below
export function renderSoundBalanceConfig(snapshot: Snapshot) {
  const rendered: Array<string> = ['']
  const children = enabledConfigItems.enabled.children
  for (const [key, value] of Object.entries(snapshot.config)) {
    if (key in children) {
      rendered.push(`'${key}': { ...sfxItem, value: ${value} },`)
    }
  }
  // console.log(rendered.join('\n'))
  navigator.clipboard.writeText(rendered.join('\n'))
  return rendered
}

// settings for slider in debug gui
const sfxItem = {
  min: 0,
  max: 1,
  step: 0.01,
} as const

export const enabledConfigItems = {

  enabled: {
    children: {
      'sound-hover': { ...sfxItem, value: 0.05 },
      'sound-unhover': { ...sfxItem, value: 0.05 },
      'sound-click': { ...sfxItem, value: 0.04 },
      'sound-unclick': { ...sfxItem, value: 0.03 },
      'sound-collapse': { ...sfxItem, value: 0.1 },

      'sound-smStart': { ...sfxItem, value: 0.05 },
      'sound-settingsOpen': { ...sfxItem, value: 0.1 },
      'sound-settingsClose': { ...sfxItem, value: 0.1 },

      'sound-chessClick': { ...sfxItem, value: 0.05 },
      'sound-chessCancel': { ...sfxItem, value: 0.08 },
      'sound-chessLand': { ...sfxItem, value: 0.2 },
      'sound-chessGoodCapture': { ...sfxItem, value: 0.2 },
      'sound-chessBadCapture': { ...sfxItem, value: 0.5 },
      'sound-chessJump': { ...sfxItem, value: 0.07 },
      'sound-chessCelebrate': { ...sfxItem, value: 0.08 },
    } satisfies Record<`sound-${SoundEffectName}`, NumericItem>,
  },
}
