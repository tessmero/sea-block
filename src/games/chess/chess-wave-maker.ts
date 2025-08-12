/**
 * @file chess-wave-maker.ts
 *
 * Helper to animate hidden sphere  that slowly orbits
 * around chess board at water level.
 */

import type { Sphere } from 'core/sphere'
import { Vector3 } from 'three'

const forceDummy = new Vector3()

export class ChessWaveMaker {
  private wmAngle = 0 // radians
  private wmSpeed = 3e-4 // change in angle per ms
  private wmRadius = 7 // distance from center of chess board
  private readonly wmTarget = new Vector3() // point at angle/radius
  private wmForce = 1e-5 // push sphere towards target

  private readonly waveMaker: Sphere

  constructor(sphere: Sphere) {
    this.waveMaker = sphere
    this.waveMaker.isGhost = false
    this.waveMaker.scalePressure = 0.2
    // this.waveMaker.isFish = true
    // this.waveMaker.isVisible = false

    // jump to target position
    this.updateWaveMaker(0)
    // this.waveMaker.position.copy(this.wmTarget) // sphere .position is only a getter
    this.waveMaker.position = this.wmTarget
  }

  public updateWaveMaker(dt: number) {
    // update target
    this.wmAngle += this.wmSpeed * dt
    this.wmTarget.set(
      this.wmRadius * Math.cos(this.wmAngle),
      this.waveMaker.position.y,
      this.wmRadius * Math.sin(this.wmAngle),
    )

    // push towards target
    this.accelSphere(this.waveMaker, this.wmTarget, this.wmForce * dt)
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
