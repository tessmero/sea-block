/**
 * @file lerp-camera.ts
 *
 * Helper function to lerp between two camera angles in
 * a way that looks natural.
 */

import type { Camera } from 'three'
import { Spherical, Vector3 } from 'three'

const _desiredOffset = new Vector3()
const _relPos = new Vector3()
const _currentSpherical = new Spherical()
const _desiredSpherical = new Spherical()

// Latch state for interpCamera theta direction
let _thetaDirection: number | null = null

/**
 * Resets the theta direction latch for interpCamera.
 */
export function resetInterpCameraLatch() {
  _thetaDirection = null
}

// function lerpAngles(a0: number, a1: number, t: number): number {
//   let delta = a1 - a0
//   while (delta > Math.PI) delta -= 2 * Math.PI
//   while (delta < -Math.PI) delta += 2 * Math.PI
//   return a0 + delta * t
// }

/**
 * Smoothly lerps the camera position around a target using spherical coordinates.
 * @param camera The camera to move.
 * @param target The target Vector3 to orbit around.
 * @param desiredOffset The desired offset from the target (in world space).
 * @param dt Delta time (ms).
 */
export function lerpCameraSpherical(
  camera: Camera,
  target: Vector3,
  desiredOffset: Vector3,
  dt: number,
) {
  _desiredOffset.copy(desiredOffset)
  _relPos.subVectors(camera.position, target)

  _currentSpherical.setFromVector3(_relPos)
  _desiredSpherical.setFromVector3(_desiredOffset)

  const t = Math.min(1, 0.005 * dt)
  _currentSpherical.radius += (_desiredSpherical.radius - _currentSpherical.radius) * t
  _currentSpherical.theta += (_desiredSpherical.theta - _currentSpherical.theta) * t
  _currentSpherical.phi += (_desiredSpherical.phi - _currentSpherical.phi) * t

  camera.position.copy(
    _relPos.setFromSpherical(_currentSpherical).add(target),
  )
}

export function interpCamera(
  camera: Camera,
  target0: Vector3,
  target1: Vector3,
  offset0: Vector3,
  offset1: Vector3,
  ratio: number,
) {
  // Interpolate target linearly
  const interpTarget = new Vector3().lerpVectors(target0, target1, ratio)

  // Interpolate offset spherically
  const spherical0 = new Spherical().setFromVector3(offset0)
  const spherical1 = new Spherical().setFromVector3(offset1)
  const interpSpherical = new Spherical()
  interpSpherical.radius = spherical0.radius + (spherical1.radius - spherical0.radius) * ratio

  // Latch the direction for theta interpolation
  let deltaTheta = spherical1.theta - spherical0.theta
  while (deltaTheta > Math.PI) deltaTheta -= 2 * Math.PI
  while (deltaTheta < -Math.PI) deltaTheta += 2 * Math.PI
  if (_thetaDirection === null) {
    _thetaDirection = deltaTheta >= 0 ? 1 : -1
  }
  // Force deltaTheta to keep the latched direction
  if (Math.sign(deltaTheta) !== _thetaDirection && Math.abs(deltaTheta) > 1e-5) {
    // Adjust for wrap-around
    if (_thetaDirection === 1 && deltaTheta < 0) deltaTheta += 2 * Math.PI
    if (_thetaDirection === -1 && deltaTheta > 0) deltaTheta -= 2 * Math.PI
  }
  interpSpherical.theta = spherical0.theta + deltaTheta * ratio

  interpSpherical.phi = spherical0.phi + (spherical1.phi - spherical0.phi) * ratio
  const interpOffset = new Vector3().setFromSpherical(interpSpherical)

  // Set camera position
  camera.position.copy(interpTarget).add(interpOffset)

  // Make camera look at the interpolated target
  camera.lookAt(interpTarget)

  return camera
}
