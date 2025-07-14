/**
 * @file rng-util.ts
 *
 * Utilities involving random numbers.
 *
 * Provides pseudo-random number generator that can be seeded
 * to consistently produce the same results.
 */

export class SeedablePRNG {
  constructor(private seed: number) {}

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
}

// randomly choose element from list and maintain types
export function randChoice<
  TOptionList extends ReadonlyArray<string>,
>(options: TOptionList):
TOptionList[number] {
  return options[Math.floor(Math.random() * options.length)]
}
