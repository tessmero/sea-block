/**
 * @file chess-wave-maker.ts
 *
 * Helper to animate hidden sphere  that slowly orbits
 * around chess board at water level.
 */

import type { Sphere } from 'core/sphere'
import type { GameUpdateContext } from 'games/game'
import type { SeaBlock } from 'sea-block'
import { Vector3 } from 'three'

const forceDummy = new Vector3()

export class ChessWaveMaker {
  private wmAngle = 0 // radians
  private wmSpeed = 3e-4 // change in angle per ms
  public wmRadius = 7 // distance from center of chess board
  private readonly wmTarget = new Vector3() // point at angle/radius
  private wmForce = 1e-5 // push sphere towards target

  public readonly sphere: Sphere

  constructor(sphere: Sphere, seaBlock: SeaBlock) {
    this.sphere = sphere
    this.sphere.isGhost = false
    this.sphere.scalePressure = 0.2
    // this.waveMaker.isFish = true
    // this.waveMaker.isVisible = false

    // jump to target position
    this.updateWaveMaker({ dt: 0, seaBlock })
    // this.waveMaker.position.copy(this.wmTarget) // sphere .position is only a getter
    this.sphere.position = this.wmTarget
  }

  public updateWaveMaker(context: GameUpdateContext) {
    const { dt, seaBlock } = context

    const { x, z } = seaBlock.terrain.centerXZ

    // update target
    this.wmAngle += this.wmSpeed * dt
    this.wmTarget.set(
      x + this.wmRadius * Math.cos(this.wmAngle),
      this.sphere.position.y,
      z + this.wmRadius * Math.sin(this.wmAngle),
    )

    // push towards target
    this.accelSphere(this.sphere, this.wmTarget, this.wmForce * dt)

    // respawn if fell under terrain
    if (seaBlock && this.sphere.position.y < 10) {
      this.sphere.position = this.wmTarget
    }
  }

  protected accelSphere(sphere: Sphere, target: Vector3, magnitude: number) {
    forceDummy.set(
      target.x - sphere.position.x,
      0,
      target.z - sphere.position.z,
    ).normalize()

    forceDummy.multiplyScalar(magnitude)
    sphere.velocity.x += forceDummy.x
    sphere.velocity.z += forceDummy.z
  }
}
