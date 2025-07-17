/**
 * @file sea-block-config.ts
 *
 * Combined config tree displayed in user interface.
 */
import { toggleSound } from '../sounds'
import { Configurable } from './configurable'
import { gfxConfig } from './gfx-config'
import { physicsConfig } from './physics-config'
import { michaelConfig } from './michael-config'
import type { ConfigTree } from './config-tree'
import { topConfig } from './top-config'
import { freeCamGameConfig } from './free-cam-game-config'

const seaBlockConfigTree = {

  children: {
    firstLink: { // link to this repo
      label: 'Check me out on Github',
      action: () => { window.open('https://github.com/tessmero/sea-block', '_blank') },
      hasNoEffect: true, // clicking button doesn't effect seablock
    },

    ...topConfig.tree.children, // unpack children at top level
    gfx: gfxConfig.tree,
    phsyics: physicsConfig.tree,
    freeCamGame: freeCamGameConfig.tree,
    michael: michaelConfig.tree,

    musicTest: { // test built song
      label: 'Play/Stop Music',
      action: () => { toggleSound('song') },
      hasNoEffect: true, // clicking button doesn't effect seablock
    },
  },
} satisfies ConfigTree

class SeaBlockConfig extends Configurable<typeof seaBlockConfigTree> {
  static { Configurable.register('sea-block', () => new SeaBlockConfig()) }
  tree = seaBlockConfigTree
}

export const seaBlockConfig = Configurable.create('sea-block') as SeaBlockConfig
