/**
 * @file sea-block-config.ts
 *
 * Top-level config tree used to build user interface.
 */
import { Configurable } from './configurable'
import { gfxConfig } from './gfx-config'
import { physicsConfig } from './physics-config'
import { michaelConfig } from './michael-config'
import type { ConfigTree } from './config-tree'
import { gridConfig } from './grid-config'
import { freeCamGameConfig } from './free-cam-game-config'

const seaBlockConfigTree = {
  children: {
    // firstLink: { // link to this repo
    //   label: 'tessmero/sea-block (Viewer)',
    //   action: () => { window.open('https://github.com/tessmero/sea-block', '_blank') },
    //   hasNoEffect: true, // doesn't effect seablock
    // },
    // secondLink: { // link to terrain generator
    //   label: generator.label,
    //   action: () => { window.open(generator.url, '_blank') },
    //   hasNoEffect: true,
    // },
    ...gridConfig.tree.children,
    gfx: gfxConfig.tree,
    phsyics: physicsConfig.tree,
    freeCamGame: freeCamGameConfig.tree,
    michael: michaelConfig.tree,
  },
} satisfies ConfigTree

class SeaBlockConfig extends Configurable<typeof seaBlockConfigTree> {
  static { Configurable.register('sea-block', () => new SeaBlockConfig()) }
  tree = seaBlockConfigTree
}

export const seaBlockConfig = Configurable.create('sea-block') as SeaBlockConfig
