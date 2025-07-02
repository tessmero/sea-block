/**
 * @file grid-config.ts
 *
 * Configuration for grid tile shape.
 * Also used for debugging and style options.
 */

import { allGenerators } from '../generators/generators-list'
import { allTilings } from '../grid-logic/tilings/tilings-list'
import { ConfigTree, OptionParam } from './config-tree'

// flat config types
interface GridConfig extends ConfigTree {
  children: {
    generator: OptionParam
    tiling: OptionParam
    mouseControl: OptionParam
    debug: OptionParam
  }
}

function randChoice(options: string[]) {
  return options[Math.floor(Math.random() * options.length)]
}

// flat config details
export const gridConfig: GridConfig = {
  children: {

    generator: {
      value: 'Michael2-3B', // randChoice(Object.keys(allGenerators)),
      options: Object.keys(allGenerators),
      resetOnChange: 'full',
    },

    tiling: {
      value: randChoice(['square', 'hex', 'octagon']), // randChoice(Object.keys(allTilings)),
      options: Object.keys(allTilings),
      resetOnChange: 'full',
    },

    mouseControl: {
      // value: 'touch-water',
      value: 'direct-sphere',
      options: [
        'touch-water',
        'direct-sphere',
      ],
      hidden: true,
    },

    debug: {
      value: 'none',
      // value: 'pick-tile',
      options: [
        { value: 'none', tooltip: 'No debugging. Mouse input controls player movement' },
        { value: 'pick-direction', tooltip: 'Show picked point at sea level used for movement direction' },
        { value: 'pick-tile', tooltip: 'Show picked tile, neighboring tiles, and normal vector' },
      ],
      hidden: true,
    },

  },
}
