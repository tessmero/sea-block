/**
 * @file game.ts
 *
 * Base class for minigames/animations.
 * Games are focused on high-level scripted logic.
 *
 * Games delegate to the tile grid and physics simulations
 * through the terrain (TileGroup with TileSim)
 * and sphereGroup (with SphereSim).
 */

import type { Camera, Vector2, Vector3 } from 'three'
import type { OrbitControls } from 'three/examples/jsm/Addons.js'
import type { SphereGroup } from '../groups/sphere-group'
import { Configurable } from '../configurable'
import type { ConfigTree } from '../configs/config-tree'
import type { TileGroup } from '../groups/tile-group'
import type { TileIndex } from '../grid-logic/indexed-grid'

// parameters to reset a game
export interface GameContext {
  terrain: TileGroup
  sphereGroup: SphereGroup
  camera: Camera
  controls: OrbitControls
}

// parameters for update each frame
export interface GameUpdateContext extends GameContext {
  mouseState?: MouseState // processed mouse input
  dt: number // (ms) delta-time since last frame
}

// mouse input in terms of viewport and tile grid
export interface MouseState {
  screenPos: Vector2 // point in viewport
  intersection: Vector3 // picked point in world
  pickedTileIndex?: TileIndex // picked tile in world
}

export abstract class Game<T extends ConfigTree> extends Configurable<T> {
  public abstract reset(context: GameContext): void
  public resetCamera(_context: GameContext): void {}

  public abstract update(context: GameUpdateContext): void
}
