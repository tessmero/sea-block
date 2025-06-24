/**
 * @file grid-config.ts
 *
 * Configuration for grid tile shape.
 * Also used for debugging and style options.
 */

import { CustomStyle } from '../gfx/styles/custom-style'
import { allStyles } from '../gfx/styles/styles-list'
import { allTilings } from '../grid-logic/tilings/tiling-util'
import { style } from '../main'
import { Config, ConfigButton, OptionParam } from './config'

// flat config types
type GridParams = {
  tiling: OptionParam
  debug: OptionParam
  style: OptionParam
  copyStyle: ConfigButton
  pasteStyle: ConfigButton
}

export interface GridConfig extends Config {
  params: GridParams
}

export type GridValues = {
  [K in keyof GridParams]: string
}

function randChoice(options: string[]) {
  return options[Math.floor(Math.random() * options.length)]
}

// flat config details
export const gridConfig: GridConfig = {
  params: {

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
      value: 'Copy Style',
      action: () => navigator.clipboard.writeText(
        JSON.stringify(style.css, null, 2)),
      readonly: true,
    },

    pasteStyle: {
      value: 'Paste Style',
      action: async () => {
        const text = await navigator.clipboard.readText()
        CustomStyle.setCustomCss(text)
        gridConfig.params.style.value = 'custom'
      },
    },
  },
}

// called in scene debugElems.refresh
export function getGridValues(): GridValues {
  const values = {} as GridValues
  for (const key in gridConfig.params) {
    values[key] = gridConfig.params[key].value
  }
  return values
}
