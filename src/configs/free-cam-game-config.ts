/**
 * @file free-cam-game-config.ts
 *
 * Configurable for free-cam game.
 */

import type { ConfigTree } from './config-tree'
import { Configurable } from './configurable'

const freeCamGameConfigTree = {
  children: {
    CAM_ACCEL: { value: 2e-4, // strength of user direction force
      min: 0,
      max: 5e-4,
      step: 1e-6,
      tooltip: 'camera movement acceleration',
    },
  },
} satisfies ConfigTree

// register Configurable
export class FreeCamGameConfig extends Configurable<typeof freeCamGameConfigTree> {
  static { Configurable.register('free-cam', () => new FreeCamGameConfig()) }
  tree = freeCamGameConfigTree
}
export const freeCamGameConfig = Configurable.create('free-cam') as FreeCamGameConfig
