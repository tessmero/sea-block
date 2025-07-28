/**
 * @file game.ts
 *
 * Base class for minigames/animations.
 * Games are focused on high-level scripted logic.
 *
 * Games delegate to the tile grid and physics simulations
 * through the terrain (TileGroup with TileSim)
 * and sphereGroup (with SphereSim).
 *
 * Game subclasses register static arrays of game-specific
 * visual elements, used to preload assets on startup.
 */

import type { Vector3 } from 'three'
import type { GameName, GuiName } from '../imp-names'
import type { SeaBlock } from '../sea-block'

import { CAMERA, CAMERA_LOOK_AT, PORTRAIT_CAMERA } from '../settings'
import { Gui } from '../guis/gui'

// parameters for update each frame
export interface GameUpdateContext {
  seaBlock: SeaBlock
  dt: number // (ms) delta-time since last frame
}

export abstract class Game {
  public gui!: Gui // assigned in create

  public abstract reset(context: SeaBlock): void
  public resetCamera(_context: SeaBlock): void {}

  protected getCamOffset(context: SeaBlock): Vector3 {
    const { w, h } = context.layeredViewport
    return h > w ? PORTRAIT_CAMERA : CAMERA
  }

  protected getCamTargetOffset(): Vector3 { return CAMERA_LOOK_AT }
  public doesAllowOrbitControls(_context: SeaBlock): boolean {
    return true
  }

  public update(_context: GameUpdateContext): void {
    // od nothing
  }

  // static registry pattern
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static _registry: Record <GameName, RegisteredGame> = {} as any

  protected constructor() {}

  static register(name: GameName, rg: RegisteredGame): void {
    if (name in this._registry) {
      throw new Error(`Game already registered: '${name}'`)
    }
    this._registry[name] = rg
  }

  static create(name: GameName, context: SeaBlock): Game {
    const { factory, guiName } = this._registry[name]
    const instance = factory()

    // Game
    // post-construction setup
    if (context) {
      instance.gui = Gui.create(guiName)
      instance.reset(context)
      instance.gui.refreshLayout(context)
    }

    return instance
  }
}

// object that subclassese should pass to Game.register()
interface RegisteredGame {
  readonly factory: () => Game
  readonly guiName: GuiName
}
