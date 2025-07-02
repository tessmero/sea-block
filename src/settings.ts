/**
 * @file settings.ts
 *
 * Core settings for sea-block.
 * Default terrain generator settings can be found in generator implementations.
 */
import { Vector3 } from 'three'

export const SPHERE_RADIUS = 1 // size of sphere
export const GRID_DETAIL = 50 // number of grid segments

if (GRID_DETAIL % 2 !== 0) {
  throw new Error('grid detail must be even')
}

// camera relative to player x/z position
const camScale = 25
export const CAMERA: Vector3 = new Vector3(camScale, camScale, camScale)
export const CAMERA_LOOK_AT: Vector3 = new Vector3(0, 10, 0)
export const DEBUG_PICKED_POINT: boolean = false // show sphere at mouse target

export const STEP_DURATION = 5 // (ms) simulation detail for spheres and water
export const COLLISION_KERNEL_RADIUS = 2 // 2->5x5 tiles around sphere to collide with
