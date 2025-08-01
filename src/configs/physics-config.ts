/**
 * @file physics-config.ts
 *
 * Water and sphere physics settings.
 */

import { Configurable } from './configurable'
import type { ConfigTree } from './config-tree'

const GRAVITY = 5e-4
const AIR_RESISTANCE = 1e-2

// sphere-sphere collisions
const RESTITUTION = 0.8
const SPHERE_COHESION = 0
const SPHERE_STIFFNESS = 0.002
const SPHERE_DAMPING = 0.0005

// springs between water tiles
const WATER_FRICTION = 5e-4
const WATER_SPRING = 3e-4 // spring towards neighbor tile level
const WATER_CENTERING = 1e-4 // spring towards sea level
const WATER_DAMPING = 1e-4

// hacky sphere-water interaction
const WAVE_AMPLITUDE = 10 // how far water tile moves
const BUOYANT_FORCE = 2e-4 // tile pushes sphere up
const PRESSURE_FORCE = 4e-4 // sphere pushes tile down

const physicsConfigTree = {
  tooltip: 'settings for spheres and waves',
  children: {
    GRAVITY: { value: GRAVITY,
      min: 1e-4,
      max: 5e-3,
      step: 1e-4 },
    AIR_RESISTANCE: { value: AIR_RESISTANCE,
      min: 0,
      max: 1,
      step: 1e-3,
      tooltip: 'fraction of sphere speed lost per step' },
    RESTITUTION: { value: RESTITUTION,
      min: 0,
      max: 1,
      step: 0.01,
      tooltip: 'fraction of sphere speed maintained in solid terrain bounce' },
    SPHERE_COHESION: { value: SPHERE_COHESION, isHidden: true,
      min: 0,
      max: 0.01,
      step: 1e-4 },
    SPHERE_STIFFNESS: { value: SPHERE_STIFFNESS, isHidden: true,
      min: 0,
      max: 0.01,
      step: 1e-4 },
    SPHERE_DAMPING: { value: SPHERE_DAMPING, isHidden: true,
      min: 0,
      max: 0.01,
      step: 1e-5 },
    WATER_FRICTION: { value: WATER_FRICTION,
      min: 0,
      max: 1,
      step: 1e-5,
      tooltip: 'fraction of tile speed lost per step' },
    WATER_SPRING: { value: WATER_SPRING,
      min: 0,
      max: 0.01,
      step: 1e-5,
      tooltip: 'springs pushing water tile towards neighboring tiles\' heights' },
    WATER_CENTERING: { value: WATER_CENTERING,
      min: 0,
      max: 0.01,
      step: 1e-5,
      tooltip: 'spring pushing water tile towards sea level' },
    WATER_DAMPING: { value: WATER_DAMPING,
      min: 0,
      max: 0.01,
      step: 1e-5,
      tooltip: 'damping for water tile springs' },
    WAVE_AMPLITUDE: { value: WAVE_AMPLITUDE,
      min: 0,
      max: 50,
      step: 0.1,
      tooltip: 'multiplier for water tile height changes' },
    BUOYANT_FORCE: { value: BUOYANT_FORCE,
      min: 0,
      max: 1e-3,
      step: 1e-5,
      tooltip: 'force of water tile pushing up on sphere' },
    PRESSURE_FORCE: { value: PRESSURE_FORCE,
      min: 0,
      max: 1e-3,
      step: 1e-5,
      tooltip: 'force of sphere pushing down on water tile' },
  },
} satisfies ConfigTree

// all physics settings trigger a soft reset (reload constants for sims)
for (const key in physicsConfigTree.children) {
  physicsConfigTree.children[key].resetOnChange = 'physics'
}

// register Configurable
class PhysicsConfig extends Configurable<typeof physicsConfigTree> {
  static { Configurable.register('physics', () => new PhysicsConfig()) }
  tree = physicsConfigTree
}
export const physicsConfig = Configurable.create('physics') as PhysicsConfig
