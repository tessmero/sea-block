/**
 * @file sea-block-config.ts
 *
 * Top-level config tree used to build user interface.
 */
import { MichaelTG } from '../generators/michael-tg'
import { freeCamGameConfig } from '../games/free-cam-game'
import { gridConfig } from './grid-config'
import { gfxConfig } from './gfx-config'
import { physicsConfig } from './physics-config'
import { michaelConfig } from './michael-config'
import type { ConfigTree } from './config-tree'

// export interface SeaBlockConfig extends ConfigTree {
//   children: {
//     firstLink: ConfigButton
//     secondLink: ConfigButton
//     gridConfig: GridConfig
//     sphereGameConfig: SphereGameConfig
//     gfxConfig: GfxConfig
//     physicsConfig: PhysicsConfig

//     generatorConfig?: ConfigTree
//   }
// }

const generator = new MichaelTG()

export const seaBlockConfig = {
  children: {
    firstLink: { // link to this repo
      label: 'tessmero/sea-block (Viewer)',
      action: () => { window.open('https://github.com/tessmero/sea-block', '_blank') },
      hasNoEffect: true, // doesn't effect seablock
    },
    secondLink: { // link to terrain generator
      label: generator.label,
      action: () => { window.open(generator.url, '_blank') },
      hasNoEffect: true,
    },
    ...gridConfig.children,
    gfxConfig,
    physicsConfig,
    freeCamGameConfig,
    michaelConfig,
  },
} satisfies ConfigTree

// if (generator.config) {
//   seaBlockConfig.children.generatorConfig = generator.config
// }
