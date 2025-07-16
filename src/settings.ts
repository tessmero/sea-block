/**
 * @file settings.ts
 *
 * Core settings for sea-block.
 */
import { Vector3 } from 'three'

export const SPHERE_RADIUS = 1 // size of sphere
export const GRID_DETAIL = 50 // number of grid segments

if (GRID_DETAIL % 2 !== 0) {
  throw new Error('grid detail must be even')
}

// camera relative to player x/z position
export const CAM_SCALE = 25
export const CAMERA: Vector3 = new Vector3(CAM_SCALE, CAM_SCALE, CAM_SCALE)
export const CAMERA_LOOK_AT: Vector3 = new Vector3(0, 10, 0)

export const STEP_DURATION = 5 // (ms) simulation detail for spheres and water
export const COLLISION_KERNEL_RADIUS = 2 // 2->5x5 tiles around sphere to collide with
