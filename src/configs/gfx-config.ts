/**
 * @file gfx-config.ts
 *
 * Settings for graphics, performance, and styles.
 */

import { STYLES } from '../gfx/styles/styles-list'
import type { SeaBlock } from '../sea-block'
import { Configurable } from './configurable'
import type { ConfigTree, OptionItem } from './config-tree'

// performance details
const gfxConfigTree = {
  label: 'Graphics',
  children: {
    pixelScale: {
      value: (4 * ((typeof window !== 'undefined') ? window.devicePixelRatio : 1)),
      min: 1,
      max: 20,
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
      options: Object.keys(STYLES),
    } as OptionItem<keyof typeof STYLES>,

    copyStyle: {
      label: 'Copy Style',
      action: (seaBlock: SeaBlock) => navigator.clipboard.writeText(
        JSON.stringify(seaBlock.style.css, null, 2)),
      hasNoEffect: true,
    },

    pasteStyle: {
      label: 'Paste Style',
      action: async () => {
        const text = await navigator.clipboard.readText()
        STYLES.custom = JSON.parse(text)
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
