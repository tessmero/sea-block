/**
 * @file top-config.ts
 *
 * Top-level config items.
 */

import type { GameName, GeneratorName, TilingName } from '../imp-names'
import { GAME_NAMES, GENERATOR_NAMES, TILING_NAMES } from '../imp-names'
import { randChoice } from '../util/rng'
import { Configurable } from './configurable'
import type { ConfigTree, OptionItem } from './config-tree'

const topConfigTree = {
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
      isHidden: true,
    } as OptionItem<GameName>,

    freeCamLayout: {
      value: 'desktop',
      options: ['desktop', 'landscape', 'portrait'],
      isHidden: true,
    } as OptionItem<'desktop' | 'landscape' | 'portrait'>,

    // debug: {
    //   value: 'none',
    //   // value: 'pick-tile',
    //   options: ['none', 'pick-direction', 'pick-tile'],

    //   // { value: 'none', tooltip: 'No debugging. Mouse input controls player movement' },
    //   // { value: 'pick-direction', tooltip: 'Show picked point at sea level used for movement direction' },
    //   // { value: 'pick-tile', tooltip: 'Show picked tile, neighboring tiles, and normal vector' },
    //   isHidden: true,
    // } as OptionItem<'none' | 'pick-direction' | 'pick-tile'>,

  },
} satisfies ConfigTree

class TopConfig extends Configurable<typeof topConfigTree> {
  static { Configurable.register('grid', () => new TopConfig()) }
  tree = topConfigTree
}

export const topConfig = Configurable.create('grid') as TopConfig
