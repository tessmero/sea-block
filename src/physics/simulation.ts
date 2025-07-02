/**
 * @file simulation.ts
 *
 * Base class for dynamic physics simulations.
 */

import { physicsConfig, PhysicsConfig } from '../configs/physics-config'
import { Configurable } from '../configurable'

export abstract class Simulation<M> extends Configurable<PhysicsConfig> {
  config = physicsConfig
  abstract step(members: M[]): void
}
