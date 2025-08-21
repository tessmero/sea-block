/**
 * @file walking-cube-game.ts
 *
 * Minimal wrapper for walking cube game, delegating to walking-cube-helper.
 */

import { Game } from 'games/game'
import {
  walkingCubeElements,
  resetWalkingCube,
  updateWalkingCube,
} from 'games/walking-cube/wc-helper'
import type { SeaBlock } from 'sea-block'

export class WalkingCubeGame extends Game {
  static {
    Game.register('walking-cube', {
      factory: () => new WalkingCubeGame(),
      guiName: 'free-cam', // placeholder GUI
      elements: walkingCubeElements,
    })
  }

  public reset(context: SeaBlock): void {
    // super.reset(context)
    resetWalkingCube(context)
  }

  // reset = resetWalkingCube
  update = updateWalkingCube
}
