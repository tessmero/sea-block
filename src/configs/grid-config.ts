/**
 * @file grid-config.ts
 *
 * Configuration for grid tile shape.
 * Also used for debugging and style options.
 */

import { allGenerators } from '../generators/generators-list'
import { CustomStyle } from '../gfx/styles/custom-style'
import { allStyles } from '../gfx/styles/styles-list'
import { allTilings } from '../grid-logic/tilings/tilings-list'
import { style } from '../main'
import { ConfigButton, ConfigTree, OptionParam } from './config-tree'
import { ConfigView } from './config-view'

// flat config types
interface GridConfigTree extends ConfigTree {
  children: {
    generator: OptionParam
    tiling: OptionParam
    debug: OptionParam
    style: OptionParam
    copyStyle: ConfigButton
    pasteStyle: ConfigButton
  }
}

function randChoice(options: string[]) {
  return options[Math.floor(Math.random() * options.length)]
}

// flat config details
const gridConfigTree: GridConfigTree = {
  children: {

    generator: {
      value: randChoice(Object.keys(allGenerators)),
      options: Object.keys(allGenerators),
      resetOnChange: 'full',
    },

    tiling: {
      value: randChoice(Object.keys(allTilings)),
      options: Object.keys(allTilings),
      resetOnChange: 'full',
    },

    debug: {
      value: 'none',
      // value: 'pick-neighbors',
      options: [
        { value: 'none', tooltip: 'No debugging. Mouse input controls player movement' },
        { value: 'pick-direction', tooltip: 'Show picked point at sea level used for movement direction' },
        { value: 'pick-tile', tooltip: 'Show picked tile, neighboring tiles, and normal vector' },
      ],
      hidden: true,
    },

    style: {
      value: randChoice(['default', 'tron', 'pastel', '???']),
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
        gridConfigTree.children.style.value = 'custom'
      },
    },
  },
}

// usable config object
export const gridConfig = new ConfigView(gridConfigTree)
