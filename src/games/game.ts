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

import type { Object3D, Vector2, Vector3 } from 'three'
import type { TileIndex } from '../core/grid-logic/indexed-grid'
import type { CompositeMesh } from '../gfx/3d/composite-mesh'
import type { GameName } from '../imp-names'
import type { SeaBlock } from '../sea-block'
import type { FlatButton } from '../gfx/2d/flat-button'
import { FlatGameUi } from '../flat-game-ui'
import type { CssLayout } from '../util/layout-parser'
import { CAMERA, CAMERA_LOOK_AT } from '../settings'

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
  imageLoader: (w: number, h: number) => Promise<FlatButton>// () => Promise<OffscreenCanvas>
  layoutKey: string // must have layout rectangle
  clickAction?: (seaBlock: SeaBlock) => void
  unclickAction?: (seaBlock: SeaBlock) => void
  hotkeys?: ReadonlyArray<string> // event.code values
}

// 3d object to show in three.js scene
export type DepthElement = {
  meshLoader: () => Promise<CompositeMesh | Object3D>
  layoutKey?: string // only for elements locked to camera
  clickAction?: (seaBlock: SeaBlock) => void
  unclickAction?: (seaBlock: SeaBlock) => void
  hotkeys?: ReadonlyArray<string> // event.code values
}

export abstract class Game {
  public flatUi!: FlatGameUi // assigned in create

  public abstract reset(context: SeaBlock): void
  public resetCamera(_context: SeaBlock): void {}

  protected getCamOffset(): Vector3 { return CAMERA }
  protected getCamTargetOffset(): Vector3 { return CAMERA_LOOK_AT }
  public enableOrbitControls(): boolean { return true }

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
    const { factory, layout, elements } = this._registry[name]
    const instance = factory()

    // Game
    // post-construction setup
    instance.flatUi = new FlatGameUi(layout, elements)
    instance.reset(context)
    instance.flatUi.refreshLayout(context.layeredViewport)

    return instance
  }
}
