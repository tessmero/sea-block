/**
 * @file simulation.ts
 *
 * Base class for dynamic physics simulations.
 */

export abstract class Simulation<TMember> {
  abstract step(members: Array<TMember>): void
}
