/**
 * @file settings.ts
 *
 * Core settings for sea-block.
 * Default terrain generator settings can be found in generator implementations.
 */
import { Vector3 } from 'three'

export const PIXEL_SCALE = 5 // physical device pixels
export const SPHERE_RADIUS = 1 // size of sphere
export const COLLISION_KERNEL_RADIUS = 2 // 2->5x5 tiles around sphere to collide with
export const GRID_DETAIL = 50 // number of grid segments
export const TILE_DILATE = 0.1 // expand grid tile by fraction of width and depth
export const STEP_DURATION = 5 // (ms) simulation detail for spheres and water

// camera relative to player x/z position
const camScale = 25
export const CAMERA: Vector3 = new Vector3(camScale, camScale, camScale)
export const CAMERA_LOOK_AT: Vector3 = new Vector3(0, 10, 0)
export const DEBUG_PICKED_POINT: boolean = false // show sphere at mouse target

// sphere physics
export const PLAYER_ACCEL = 8e-4 // strength of user direction force
export const MOUSE_DEADZONE = 50 // (px) center of screen with zero force
export const MOUSE_MAX_RAD = 200 // (px) radius with max force
export const GRAVITY: Vector3 = new Vector3(0, -5e-4, 0)
export const AIR_RESISTANCE = 1e-2

// sphere-sphere collisions
export const RESTITUTION = 0.8
export const SPHERE_COHESION = 0
export const SPHERE_STIFFNESS = 0.002
export const SPHERE_DAMPING = 0.0005

// springs between water tiles
export const WATER_FRICTION = 5e-4
export const WATER_SPRING = 3e-4 // spring towards neighbor tile level
export const WATER_CENTERING = 1e-4 // spring towards sea level
export const WATER_DAMPING = 1e-4

// hacky sphere-water interaction
export const WAVE_AMPLITUDE = 10 // how far water tile moves
export const BUOYANT_FORCE = 1e-4 // tile pushes sphere up
export const PRESSURE_FORCE = 1e-4 // sphere pushes tile down
