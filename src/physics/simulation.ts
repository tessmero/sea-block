/**
 * @file simulation.ts
 *
 * Base class for physics simulations.
 */

import { LeafKeyValueMap } from '../configs/config-view'
import { physicsConfig, PhysicsConfigTree } from '../configs/physics-config'

export type PhysicsValues = LeafKeyValueMap<PhysicsConfigTree>

export abstract class Simulation<T> {
  abstract step(members: T[]): void

  protected readonly physicsValues: PhysicsValues = physicsConfig.flatValues
}
