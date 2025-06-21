/**
 * @file simulation.ts
 *
 * Base class for physics simulations.
 */
import { getPhysicsValues, PhysicsValues } from '../configs/physics-config'

export abstract class Simulation<T> {
  protected physicsValues: PhysicsValues

  constructor() {
    this.resetParams()
  }

  resetParams() {
    this.physicsValues = getPhysicsValues()
  }

  abstract step(members: T[]): void
}
