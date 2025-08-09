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
