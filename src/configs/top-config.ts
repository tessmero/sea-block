/**
 * @file top-config.ts
 *
 * Top-level config items.
 */

import type { GameName, GeneratorName, TilingName } from '../imp-names'
import { GAME, GENERATOR, TILING } from '../imp-names'
import { randChoice } from '../util/rng'
import { Configurable } from './configurable'
import type { ConfigTree, OptionItem } from './config-tree'

export const isDevMode = false
function applyDevMode(cfg: typeof topConfigTree.children) {
  cfg.game.value = 'free-cam'
  // cfg.game.isHidden = false

  cfg.testGui.value = 'sprite-atlas'
  cfg.testGui.isHidden = false
}

const topConfigTree = {
  children: {

    generator: {
      value: 'Michael2-3B', // randChoice(Object.keys(allGenerators)),
      options: GENERATOR.NAMES,
      resetOnChange: 'full',
    } as OptionItem<GeneratorName>,

    tiling: {
      value: randChoice(['square', 'octagon'] as const),
      options: TILING.NAMES,
      resetOnChange: 'full',
    } as OptionItem<TilingName>,

    game: {
      value: 'start-sequence',
      options: GAME.NAMES,
      isHidden: true,
    } as OptionItem<GameName>,

    freeCamLayout: {
      label: 'Input Layout',
      value: 'auto',
      options: ['auto', 'desktop', 'landscape', 'portrait'],
    } as OptionItem<'auto' | 'desktop' | 'landscape' | 'portrait'>,

    testGui: {
      value: 'none',
      options: ['none', 'sprite-atlas'],
      // isHidden: true,
    } as OptionItem<'none' | 'settings-menu' | 'sprite-atlas'>,

    transitionMode: {
      label: 'Transitions',
      value: 'enabled',
      options: ['enabled', 'skip'],
    } as OptionItem<'enabled' | 'skip'>,
  },
} satisfies ConfigTree

if (isDevMode) {
  applyDevMode(topConfigTree.children)
}

class TopConfig extends Configurable<typeof topConfigTree> {
  static { Configurable.register('top', () => new TopConfig()) }
  tree = topConfigTree
}

export const topConfig = Configurable.create('top') as TopConfig
