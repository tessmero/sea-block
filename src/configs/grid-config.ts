/**
 * @file grid-config.ts
 *
 * Configuration for grid tile shape.
 * Also used for any top-level config items.
 */

import type { GameName, GeneratorName, TilingName } from '../imp-names'
import { GAME_NAMES, GENERATOR_NAMES, TILING_NAMES } from '../imp-names'
import { randChoice } from '../rng-util'
import { Configurable } from './configurable'
import type { ConfigTree, OptionItem } from './config-tree'

const gridConfigTree = {
  children: {

    generator: {
      value: 'Michael2-3B', // randChoice(Object.keys(allGenerators)),
      options: GENERATOR_NAMES,
      resetOnChange: 'full',
    } as OptionItem<GeneratorName>,

    tiling: {
      value: randChoice(['square', 'octagon'] as const),
      options: TILING_NAMES,
      resetOnChange: 'full',
    } as OptionItem<TilingName>,

    game: {
      value: 'start-sequence',
      options: GAME_NAMES,
    } as OptionItem<GameName>,

    debug: {
      value: 'none',
      // value: 'pick-tile',
      options: ['none', 'pick-direction', 'pick-tile'],

      // { value: 'none', tooltip: 'No debugging. Mouse input controls player movement' },
      // { value: 'pick-direction', tooltip: 'Show picked point at sea level used for movement direction' },
      // { value: 'pick-tile', tooltip: 'Show picked tile, neighboring tiles, and normal vector' },
      isHidden: true,
    } as OptionItem<'none' | 'pick-direction' | 'pick-tile'>,

  },
} satisfies ConfigTree

class GridConfig extends Configurable<typeof gridConfigTree> {
  static { Configurable.register('grid', () => new GridConfig()) }
  tree = gridConfigTree
}

export const gridConfig = Configurable.create('grid') as GridConfig
