/**
 * @file simulation.ts
 *
 * Base class for dynamic physics simulations.
 */

import type { PhysicsConfig } from '../configs/physics-config'
import { physicsConfig } from '../configs/physics-config'
import { Configurable } from '../configurable'

export abstract class Simulation<M> extends Configurable<PhysicsConfig> {
  config = physicsConfig
  abstract step(members: Array<M>): void
}
