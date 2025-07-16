/**
 * @file terrain-generator.ts
 *
 * Base class for generators that output terrain heights.
 */

import type { Color } from 'three'
import type { GeneratorName } from '../imp-names'
import { michaelConfig } from '../configs/michael-config'
import { SeedablePRNG } from '../util/rng'
import type { CssStyle } from '../util/style-parser'

export interface GeneratedTile {
  height: number
  color: Color
  isWater: boolean
  isFlora: boolean
}

export abstract class TerrainGenerator {
  public readonly config = michaelConfig

  public abstract readonly label: string
  public abstract readonly url: string
  public abstract readonly style: CssStyle

  public abstract getTile(x: number, z: number): GeneratedTile

  private prng: SeedablePRNG = new SeedablePRNG(0)
  protected xzScale: number = 1

  public refreshConfig(): void {
    this.config.refreshConfig()
    this.xzScale = Math.pow(10, this.config.flatConfig.xzLogScale)
    this.prng = new SeedablePRNG(this.config.flatConfig.seed)
  }

  // static registry pattern
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static _registry: Record<GeneratorName, () => TerrainGenerator> = {} as any

  protected constructor() {}

  static register(name: GeneratorName, factory: () => TerrainGenerator): void {
    if (name in this._registry) {
      throw new Error(`TerrainGenerator already registered: '${name}'`)
    }
    this._registry[name] = factory
  }

  static create(name: GeneratorName): TerrainGenerator {
    const factory = this._registry[name]
    const instance = factory()

    // TerrainGenerator
    // post-construction setup
    instance.refreshConfig()

    // console.log(`created generator ${name} -> ${instance.constructor.name}`)

    return instance
  }
}
