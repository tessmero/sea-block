/**
 * @file sphere-test-game.ts
 *
 * Original sea-block moving sphere controls impemented as a game.
 */
import { Color, Vector2, Vector3 } from 'three'
import type { SeaBlock } from '../sea-block'
import type { Sphere } from '../core/sphere'
import { Game } from './game'
import type { GameUpdateContext } from './game'

const PLAYER_ACCEL = 5e-5 // strength of user direction force

const MOUSE_DEADZONE = 50 // (px) center of screen with zero force
const MOUSE_MAX_RAD = 200 // (px) radius with max force

const mouseVec = new Vector2()
const force = new Vector3()

export class SphereTestGame extends Game {
  static {
    Game.register('sphere-test', {
      factory: () => new SphereTestGame(),
      elements: [],
      layout: () => ({}),
    })
  }

  // assigned in reset
  private player!: Sphere
  private lastPlayerPosition!: Vector3

  public reset(context: SeaBlock): void {
    const { sphereGroup, camera } = context

    // Create a player sphere
    this.player = sphereGroup.members[0]
    this.player.isGhost = false
    this.player.isFish = false
    this.player.isVisible = true
    sphereGroup.setInstanceColor(0, new Color(0xff0000))
    const { x, z } = this.player.position
    this.player.position = new Vector3(x, 30, z)
    this.lastPlayerPosition = this.player.position.clone()

    // hide other spheres
    for (let i = 1; i < sphereGroup.members.length; i++) {
      sphereGroup.members[i].isGhost = true
    }

    // position camera and grid on player
    const cam = this.getCamOffset(context)
    camera.position.set(x + cam.x, cam.y, z + cam.z)
    this.centerOnPlayer(context)
  }

  public update(context: GameUpdateContext): void {
    const { seaBlock, dt } = context
    const { mouseState } = seaBlock

    this.flatUi.update(context)

    // pan grid if necessary
    this.centerOnPlayer(context.seaBlock)

    if (!mouseState) {
      return
    }

    const { screenPos, intersection } = mouseState
    const { player } = this

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

  private centerOnPlayer(context: SeaBlock) {
    const { player, lastPlayerPosition } = this
    const { terrain, camera, orbitControls } = context

    if (!player) return

    const { x, z } = player.position
    camera.position.set(
      x + (camera.position.x - lastPlayerPosition.x),
      camera.position.y, // y + (camera.position.y - lastPlayerPosition.y),
      z + (camera.position.z - lastPlayerPosition.z),
    )
    this.lastPlayerPosition = player.position.clone()
    const cto = this.getCamTargetOffset()
    orbitControls.target.set(x + cto.x, cto.y, z + cto.z)
    orbitControls.update()

    terrain.panToCenter(x, z)
  }
}
