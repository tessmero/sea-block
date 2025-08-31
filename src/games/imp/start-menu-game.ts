/**
 * @file start-menu-game.ts
 *
 * Game active after clicking launch on splash screen.
 */

import { Game } from 'games/game'
import type { SeaBlock } from 'sea-block'
import { smUpdate } from 'games/start-menu/sm-update'

export class StartMenuGame extends Game {
  public reset(_context: SeaBlock): void {
    // do nothing
  }

  update = smUpdate

  static {
    Game.register('start-menu', {
      factory: () => new StartMenuGame(),
      guiName: 'start-menu',
      elements: [],
    })
  }

  // use gamepad to navigate gui
  public doesAllowGgui(): boolean {
    return true
  }

  // do not render 3d world
  public doesAllow3DRender(): boolean {
    return false
  }
}
