/**
 * @file top-config.ts
 *
 * Top-level config items.
 */

import type { GameName, GeneratorName, TilingName } from '../../imp-names'
import { GAME, GENERATOR, TILING } from '../../imp-names'
import { Configurable } from '../configurable'
import type { ConfigTree, OptionItem } from '../config-tree'

export const isDevMode = true
function applyDevMode(cfg: typeof topConfigTree.children) {
  cfg.game.value = 'free-cam' // skip start menu
  cfg.game.isHidden = false // show in debug controls

  // cfg.generator.value = 'flat'
  cfg.generator.value = 'all-ocean'
  cfg.tiling.value = 'square'
  cfg.freeCamLayout.value = 'landscape'

  cfg.transitionMode.value = 'skip'

  // cfg.testGui.value = 'sprite-atlas'
  // cfg.testGui.isHidden = false
}

// let original: Snapshot
// let current: Snapshot

// export function startupSnapshot(seaBlock) {
//   if (original) return
//   original = saveSnapshot(seaBlock)
// }
// const testSnapshot = {
//   config: {
//     visibleRadius: 11,
//     offsetX: -94.57554124214874,
//     offsetZ: 48.587894021613195,
//     exponent: 3,
//   },
//   style: {},
// }

const topConfigTree = {
  children: {

    // test: {
    //   action: (seaBlock) => {
    //     startupSnapshot(seaBlock)
    //     restoreSnapshot(seaBlock, testSnapshot)
    //     seaBlock.onGameChange()
    //   },
    // },

    // snapshot: {
    //   action: (seaBlock) => {
    //     if (original) {
    //       console.log('snapshot compare')
    //       current = saveSnapshot(seaBlock)
    //       debugSnapshotDelta(original, current)
    //     }
    //     else {
    //       console.log('snapshot original')
    //       original = saveSnapshot(seaBlock)
    //     }
    //   },
    // } as ConfigButton,

    generator: {
      value: 'Michael2-3B', // randChoice(Object.keys(allGenerators)),
      options: GENERATOR.NAMES,
      resetOnChange: 'full',
    } as OptionItem<GeneratorName>,

    tiling: {
      value: 'square', // randChoice(['square', 'octagon'] as const),
      options: TILING.NAMES,
      resetOnChange: 'full',
    } as OptionItem<TilingName>,

    game: {
      value: 'start-menu', // 'free-cam',
      options: GAME.NAMES,
      // options: ['walking-cube', 'chess', 'tile-inspector', 'free-cam', 'start-sequence'],
      // isHidden: true,
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
    } as OptionItem<'none' | 'sprite-atlas'>,

    transitionMode: {
      label: 'Transitions',
      value: 'enabled',
      options: ['enabled', 'skip'],
      // isHidden: true,
    } as OptionItem<'enabled' | 'skip'>,
  },
} satisfies ConfigTree

if (isDevMode) { // apply dev config
  applyDevMode(topConfigTree.children)
}

class TopConfig extends Configurable<typeof topConfigTree> {
  static { Configurable.register('top', () => new TopConfig()) }
  tree = topConfigTree
}

export const topConfig = Configurable.create('top') as TopConfig
