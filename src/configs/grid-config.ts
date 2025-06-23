/**
 * @file grid-config.ts
 *
 * Configuration for grid tile shape.
 */

import { Config, OptionParam } from './config'

// flat config types
type GridParams = {
  tiling: OptionParam
  debug: OptionParam
}

export interface GridConfig extends Config {
  params: GridParams
}

export type GridValues = {
  [K in keyof GridParams]: string
}

// flat config details
export const gridConfig: GridConfig = {
  params: {

    tiling: {
      value: 'octagon',
      options: [
        'triangle',
        'square',
        'hex',
        'octagon',
      ],
      resetOnChange: 'full',
    },

    debug: {
      value: 'none',
      // value: 'pick-neighbors',
      options: [
        { value: 'none', tooltip: 'No debugging. Mouse input controls player movement' },
        { value: 'pick-direction', tooltip: 'Show picked point at sea level used for movement direction' },
        { value: 'pick-neighbors', tooltip: 'Show picked tile and neighboring tiles' },
        { value: 'pick-normal', tooltip: 'Show picked tile and normal vector' },
      ],
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
