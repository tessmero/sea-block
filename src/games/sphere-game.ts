/**
 * @file sphere-game.ts
 *
 * Original sea-block moving sphere controls impemented as a game.
 */
import { Color, Vector2, Vector3 } from 'three'
import { Game, GameContext, GameUpdateContext } from './game'
import { Sphere } from '../sphere'
import { CAMERA, CAMERA_LOOK_AT } from '../settings'
import { ConfigTree, NumericParam } from '../configs/config-tree'

export interface SphereGameConfig extends ConfigTree {
  children: {
    PLAYER_ACCEL: NumericParam
  }
}

export const sphereGameConfig: SphereGameConfig = {
  children: {
    PLAYER_ACCEL: { value: 5e-5, // strength of user direction force
      min: 0,
      max: 10e-5,
      step: 1e-6,
      tooltip: 'strength of user input force',
      resetOnChange: 'physics',
    },

  },
}

export const MOUSE_DEADZONE = 50 // (px) center of screen with zero force
export const MOUSE_MAX_RAD = 200 // (px) radius with max force
const mouseVec = new Vector2()
const force = new Vector3()

export class SphereGame extends Game<SphereGameConfig> {
  config = sphereGameConfig
  private player: Sphere
  private lastPlayerPosition: Vector3

  public reset(context: GameContext): void {
    const { sphereGroup, camera } = context

    // Create a player sphere
    this.player = sphereGroup.members[0]
    sphereGroup.setInstanceColor(0, new Color(0xff0000))
    this.lastPlayerPosition = this.player.position.clone()

    camera.position.set(
      this.lastPlayerPosition.x + CAMERA.x,
      CAMERA.y,
      this.lastPlayerPosition.z + CAMERA.z,
    )

    this.centerOnPlayer(context)
  }

  public update(context: GameUpdateContext): void {
    this.centerOnPlayer(context)

    const { mouseState, dt } = context
    if (!mouseState) {
      return
    }

    const { screenPos, intersection } = mouseState
    const { player } = this
    const { PLAYER_ACCEL } = this.flatConfig

    // Direction from player to intersection, zero y
    force.set(
      intersection.x - player.position.x,
      0,
      intersection.z - player.position.z,
    ).normalize()

    // get distance from center of screen
    mouseVec.x = screenPos.x - window.innerWidth / 2
    mouseVec.y = screenPos.y - window.innerHeight / 2
    const screenDistance = mouseVec.length()

    // Accelerate player in this direction
    let mouseRatio = (screenDistance - MOUSE_DEADZONE) / (MOUSE_MAX_RAD - MOUSE_DEADZONE)
    mouseRatio = Math.min(1, Math.max(0, mouseRatio))
    force.multiplyScalar(dt * PLAYER_ACCEL * mouseRatio)
    player.velocity.x += force.x
    player.velocity.z += force.z
  }

  private centerOnPlayer(context: GameContext) {
    const { player, lastPlayerPosition } = this
    const { terrain, camera, controls } = context

    if (!player) return

    const { x, z } = player.position
    camera.position.set(
      x + (camera.position.x - lastPlayerPosition.x),
      camera.position.y, // y + (camera.position.y - lastPlayerPosition.y),
      z + (camera.position.z - lastPlayerPosition.z),
    )
    this.lastPlayerPosition = player.position.clone()
    controls.target.set(x, CAMERA_LOOK_AT.y, z,
    )
    controls.update()

    terrain.panToCenter(x, z)
  }
}
