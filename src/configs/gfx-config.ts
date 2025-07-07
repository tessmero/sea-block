/**
 * @file gfx-config.ts
 *
 * Settings for graphics, performance, and styles.
 */

import { CustomStyle } from '../gfx/styles/custom-style'
import { allStyles } from '../gfx/styles/styles-list'
import { seaBlock } from '../main'
import type { ConfigButton, ConfigTree, NumericItem, OptionItem } from './config-tree'

export interface GfxConfig extends ConfigTree {
  children: {
    pixelScale: NumericItem
    visibleRadius: NumericItem
    extendBottom: NumericItem
    style: OptionItem
    copyStyle: ConfigButton
    pasteStyle: ConfigButton
  }
}

// performance details
export const gfxConfig: GfxConfig = {
  label: 'Graphics',
  children: {
    pixelScale: {
      value: 4,
      min: 1,
      max: 5,
      step: 1,
    },
    visibleRadius: {
      value: 15,
      min: 10,
      max: 60,
      step: 1,
    },
    extendBottom: {
      value: -132,
      min: -256,
      max: 256,
      step: 1,
    },

    style: {
      value: 'default', // randChoice(['default', 'tron', 'pastel', '???']),
      options: Object.keys(allStyles),
    },

    copyStyle: {
      label: 'Copy Style',
      action: () => navigator.clipboard.writeText(
        JSON.stringify(seaBlock.style.css, null, 2)),
      hasNoEffect: true,
    },

    pasteStyle: {
      label: 'Paste Style',
      action: async () => {
        const text = await navigator.clipboard.readText()
        CustomStyle.setCustomCss(text)
        gfxConfig.children.style.value = 'custom'
      },
    },
  },
}
