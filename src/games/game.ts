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

import type { CssLayout } from 'util/layout-parser'
import type { Object3D, Vector3 } from 'three'
import type { KeyCode } from 'input-id'
import type { CompositeMesh } from '../gfx/3d/composite-mesh'
import type { GameName } from '../imp-names'
import type { SeaBlock } from '../sea-block'
import type { FlatButton } from '../gfx/2d/flat-button'

import { CAMERA, CAMERA_LOOK_AT, PORTRAIT_CAMERA } from '../settings'
import { Gui } from '../gui'

// parameters for update each frame
export interface GameUpdateContext {
  seaBlock: SeaBlock
  dt: number // (ms) delta-time since last frame
}

// object that subclassese should pass to Game.register()
interface RegisteredGame {
  readonly factory: () => Game
  readonly elements: ReadonlyArray<GameElement> // assets to load on startup
  readonly layout: (context: SeaBlock) => CssLayout
}

// game-specific visual element
export type GameElement = FlatElement | DepthElement // 3d object or image buffer

// image to render on front canvas
export type FlatElement = {
  w: number
  h: number
  imageFactory: (w: number, h: number) => FlatButton// () => Promise<OffscreenCanvas>
  layoutKey: string // must have layout rectangle
  clickAction?: (seaBlock: SeaBlock) => void
  unclickAction?: (seaBlock: SeaBlock) => void
  isSticky?: boolean
  hotkeys?: ReadonlyArray<KeyCode> // bound keyboard keys
}

// 3d object to show in three.js scene
export type DepthElement = {
  meshLoader: () => Promise<CompositeMesh | Object3D>
  layoutKey?: string // only for elements locked to camera
  clickAction?: (seaBlock: SeaBlock) => void
  unclickAction?: (seaBlock: SeaBlock) => void
  isSticky?: boolean
  hotkeys?: ReadonlyArray<string> // event.code values
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
    const { factory, layout, elements } = this._registry[name]
    const instance = factory()

    // Game
    // post-construction setup
    instance.gui = new Gui(layout, elements)
    instance.reset(context)
    instance.gui.refreshLayout(context)

    return instance
  }
}
