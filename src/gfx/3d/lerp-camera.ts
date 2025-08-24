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

  // Interpolate offset in spherical coordinates
  // const sph0 = new Spherical().setFromVector3(offset0)
  // const sph1 = new Spherical().setFromVector3(offset1)
  // const interpSph = new Spherical(
  //   sph0.radius + (sph1.radius - sph0.radius) * ratio,
  //   sph0.theta + (sph1.theta - sph0.theta) * ratio,
  //   sph0.phi + (sph1.phi - sph0.phi) * ratio
  // )
  // const interpOffset = new Vector3().setFromSpherical(interpSph)
  const interpOffset = new Vector3().lerpVectors(offset0, offset1, ratio)

  // Set camera position
  camera.position.copy(interpTarget).add(interpOffset)

  // Make camera look at the interpolated target
  camera.lookAt(interpTarget)

  return camera
}
