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

import { Camera, Vector2, Vector3 } from 'three'
import { SphereGroup } from '../groups/sphere-group'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { Configurable } from '../configurable'
import { ConfigTree } from '../configs/config-tree'
import { TileGroup } from '../groups/tile-group'

// parameters to reset a game
export type GameContext = {
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
export type MouseState = {
  screenPos: Vector2 // point in viewport
  intersection: Vector3 // picked point in world

  // picked tile in world
  x: number
  z: number
  index: number
}

export abstract class Game<T extends ConfigTree> extends Configurable<T> {
  public abstract reset(context: GameContext): void
  public abstract update(context: GameUpdateContext): void
}
