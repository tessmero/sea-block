/**
 * @file games-list.ts
 *
 * Helper to lookup games by name.
 */

import type { ConfigTree } from '../configs/config-tree'
import { FreeCamGame } from './free-cam-game'
import type { Game } from './game'
import { SphereTestGame } from './sphere-test-game'
import { StartSequenceGame } from './start-sequence-game'

export const allGames = {
  'start-sequence': new StartSequenceGame(),
  'free-cam': new FreeCamGame(),
  'sphere-test': new SphereTestGame(),
} as const satisfies Record<string, Game<ConfigTree>>
