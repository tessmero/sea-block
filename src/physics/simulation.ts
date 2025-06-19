/**
 * @file simulation.ts
 *
 * Base class for physics simulations.
 */
export abstract class Simulation<T> {
  abstract step(members: T[]): void
}
