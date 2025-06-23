/**
 * @file settings.ts
 *
 * Core settings for sea-block.
 * Default terrain generator settings can be found in generator implementations.
 */
import { Vector3 } from 'three'

export const PIXEL_SCALE = 5 // physical device pixels
export const SPHERE_RADIUS = 1 // size of sphere
export const GRID_DETAIL = 50 // number of grid segments
export const TILE_DILATE = 0 // expand grid tile by fraction of width and depth

// camera relative to player x/z position
const camScale = 25
export const CAMERA: Vector3 = new Vector3(
  camScale,
  camScale,
  camScale,
)
export const CAMERA_LOOK_AT: Vector3 = new Vector3(
  0,
  10,
  0,
)
export const DEBUG_PICKED_POINT: boolean = false // show sphere at mouse target

export const MOUSE_DEADZONE = 50 // (px) center of screen with zero force
export const MOUSE_MAX_RAD = 200 // (px) radius with max force

export const STEP_DURATION = 5 // (ms) simulation detail for spheres and water
export const COLLISION_KERNEL_RADIUS = 2 // 2->5x5 tiles around sphere to collide with
