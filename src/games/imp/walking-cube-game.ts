/**
 * @file walking-cube-game.ts
 *
 * Minimal wrapper for walking cube game, delegating to walking-cube-helper.
 */

import type { GameUpdateContext } from 'games/game'
import { Game } from 'games/game'
import {
  WalkingCube,
} from 'games/walking-cube/wc-helper'
import type { SeaBlock } from 'sea-block'

const wc = new WalkingCube()

export class WalkingCubeGame extends Game {
  static {
    Game.register('walking-cube', {
      factory: () => new WalkingCubeGame(),
      guiName: 'free-cam', // placeholder GUI
      elements: [wc.leftFoot, wc.rightFoot, wc.torso],
    })
  }

  public reset(_context: SeaBlock): void {
    // super.reset(context)
    // resetWalkingCube(context)
    wc.reset()
  }

  // reset = resetWalkingCube
  // update = updateWalkingCube

  public update(context: GameUpdateContext): void {
    wc.update(context)
  }
}
