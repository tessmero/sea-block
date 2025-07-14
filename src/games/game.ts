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

import type { Vector2, Vector3 } from 'three'
import type { TileIndex } from '../grid-logic/indexed-grid'
import type { CssLayout } from '../gui-layout-parser'
import type { CompositeMesh } from '../gfx/3d/composite-mesh'
import type { GameName } from '../imp-names'
import type { SeaBlock } from '../sea-block'
import type { FlatButton } from '../gfx/2d/flat-button'
import { FlatGameUi } from '../ui/flat-game-ui'

// parameters for update each frame
export interface GameUpdateContext {
  seaBlock: SeaBlock // persistent state
  mouseState?: MouseState // processed mouse input
  dt: number // (ms) delta-time since last frame
}

// mouse input in terms of viewport and tile grid
export interface MouseState {
  screenPos: Vector2 // point in viewport in browser px
  lvPos: Vector2 // poitn in viewport in layeredViewport big pixels
  intersection: Vector3 // picked point in world
  pickedTileIndex?: TileIndex // picked tile in world
}

// object that subclassese should pass to Game.register()
interface RegisteredGame {
  readonly factory: () => Game
  readonly elements: ReadonlyArray<GameElement> // assets to load on startup
  readonly layout: CssLayout
}

// game-specific visual element
export type GameElement = FlatElement | DepthElement // 3d object or image buffer

// image to render on front canvas
export type FlatElement = {
  imageLoader: () => Promise<FlatButton>// () => Promise<OffscreenCanvas>
  layoutKey: string // must have layout rectangle
  clickAction?: (seaBlock: SeaBlock) => void
}

// 3d object to show in three.js scene
export type DepthElement = {
  meshLoader: () => Promise<CompositeMesh>
  layoutKey?: string // only for elements locked to camera
}

export abstract class Game {
  public flatUi!: FlatGameUi // assigned in create

  public abstract reset(context: SeaBlock): void
  public resetCamera(_context: SeaBlock): void {}

  public update(context: GameUpdateContext): void {
    this.flatUi.update(context)
  }

  // static registry pattern
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static _registry: Record<GameName, RegisteredGame> = {} as any

  protected constructor() {}

  static register(name: GameName, rg: RegisteredGame): void {
    if (name in this._registry) {
      throw new Error(`Game already registered: '${name}'`)
    }
    this._registry[name] = rg
  }

  static create(name: GameName, context: SeaBlock): Game {
    const { factory, layout } = this._registry[name]
    const instance = factory()

    // Game
    // post-construction setup
    instance.flatUi = new FlatGameUi(layout)
    instance.reset(context)
    instance.flatUi.refreshLayout(context.layeredViewport)

    // re-enable orbit controls
    context.orbitControls.enabled = true

    return instance
  }
}
