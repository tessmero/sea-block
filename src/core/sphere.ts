/**
 * @file sphere.ts
 *
 * Ball with SPHERE_RADIUS (settings.ts).
 * Collides with water and solid terrain.
 */

import type { Vector3 } from 'three'

export interface Sphere {
  position: Vector3
  velocity: Vector3
  isVisible: boolean
  isGhost: boolean // ghosts don't collide with anything
  isFish: boolean // like ghost, but still effects water
  scalePressure: number // multiply force pushing down on water
}
