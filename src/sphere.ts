/**
 * @file sphere.ts
 *
 * Ball with SPHERE_RADIUS (settings.ts).
 * Collides with water and solid terrain.
 */

import { Vector3 } from 'three'

export type Sphere = {
  position: Vector3
  velocity: Vector3
}
