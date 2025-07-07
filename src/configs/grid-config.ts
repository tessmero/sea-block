/**
 * @file grid-config.ts
 *
 * Configuration for grid tile shape.
 * Also used for any top-level config items.
 */

import { allGames } from '../games/games-list'
import { allGenerators } from '../generators/generators-list'
import { allTilings } from '../grid-logic/tilings/tilings-list'
import type { ConfigTree, OptionItem } from './config-tree'

// flat config types
export interface GridConfig extends ConfigTree {
  children: {
    generator: OptionItem & { value: keyof typeof allGenerators }
    tiling: OptionItem & { value: keyof typeof allTilings }
    game: OptionItem & { value: keyof typeof allGames }
    debug: OptionItem & { value: 'none' | 'pick-direction' | 'pick-tile' }
  }
}
function randChoice<T extends ReadonlyArray<string>>(options: T): T[number] {
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
      value: randChoice(['square', 'octagon'] as const),
      // value: randChoice(Object.keys(allTilings) as Array<keyof typeof allTilings>),
      options: Object.keys(allTilings),
      resetOnChange: 'full',
    },

    game: {
      // effective starting game is always start-squence (main.ts)
      value: 'free-cam',
      options: Object.keys(allGames),
    },

    debug: {
      value: 'none',
      // value: 'pick-tile',
      options: [
        { value: 'none', tooltip: 'No debugging. Mouse input controls player movement' },
        { value: 'pick-direction', tooltip: 'Show picked point at sea level used for movement direction' },
        { value: 'pick-tile', tooltip: 'Show picked tile, neighboring tiles, and normal vector' },
      ],
      isHidden: true,
    },

  },
}
