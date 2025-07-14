/**
 * @file gfx-config.ts
 *
 * Settings for graphics, performance, and styles.
 */

import { CustomStyle } from '../gfx/styles/custom-style'
import { allStyles } from '../gfx/styles/styles-list'
import { Configurable } from './configurable'
import type { ConfigTree } from './config-tree'

// performance details
const gfxConfigTree = {
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
      action: () => {},
      // action: () => navigator.clipboard.writeText(
      //   JSON.stringify(seaBlock.style.css, null, 2)),
      hasNoEffect: true,
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
} satisfies ConfigTree

// register Configurable
class GfxConfig extends Configurable<typeof gfxConfigTree> {
  static { Configurable.register('gfx', () => new GfxConfig()) }
  tree = gfxConfigTree
}
export const gfxConfig = Configurable.create('gfx') as GfxConfig
