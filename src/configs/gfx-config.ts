/**
 * @file gfx-config.ts
 *
 * Settings for graphics, performance, and styles.
 */

import { CustomStyle } from '../gfx/styles/custom-style'
import { allStyles } from '../gfx/styles/styles-list'
import { style } from '../main'
import { ConfigButton, ConfigTree, NumericParam, OptionParam } from './config-tree'
import { ConfigView } from './config-view'

interface GfxConfigTree extends ConfigTree {
  children: {
    pixelScale: NumericParam
    visibleRadius: NumericParam
    extendBottom: NumericParam
    style: OptionParam
    copyStyle: ConfigButton
    pasteStyle: ConfigButton
  }
}

// performance details
export const gfxConfigTree: GfxConfigTree = {
  label: 'Graphics',
  children: {
    pixelScale: {
      value: 5,
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
        JSON.stringify(style.css, null, 2)),
      noEffect: true,
    },

    pasteStyle: {
      label: 'Paste Style',
      action: async () => {
        const text = await navigator.clipboard.readText()
        CustomStyle.setCustomCss(text)
        gfxConfigTree.children.style.value = 'custom'
      },
    },
  },
}

// export usable config
export const gfxConfig = new ConfigView(gfxConfigTree)
