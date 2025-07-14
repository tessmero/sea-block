/**
 * @file simulation.ts
 *
 * Base class for dynamic physics simulations.
 */

import { physicsConfig } from '../configs/physics-config'

export abstract class Simulation<TMember> {
  public readonly config = physicsConfig
  abstract step(members: Array<TMember>): void
}
