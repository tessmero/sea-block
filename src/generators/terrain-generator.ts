/**
 * @file terrain-generator.ts
 *
 * Base class for generators that output terrain heights.
 */

import { GeneratorConfig, NumericParam } from '../ui/controls-gui'

export type RGBA = [number, number, number, number]

export abstract class TerrainGenerator<T extends GeneratorConfig> {
  static getDefaultConfig(): GeneratorConfig {
    throw new Error(`getDefaultConfig is not implemented in ${this.constructor.name}`)
  }

  public abstract getHeight(x: number, z: number): number

  public abstract getTileColor(x: number, z: number): RGBA

  public abstract isWaterTile(height: number): boolean

  protected _flatConfigValues: Record<string, number> = {}

  constructor(public config: T) {
    this.loadConfig()
  }

  public loadConfig() {
    this._parseFlatConfig(this.config)
  }

  private _parseFlatConfig(config: GeneratorConfig | NumericParam, key = '') {
    if (typeof config.value === 'number') {
      this._flatConfigValues[key] = config.value
    }
    else {
      for (const [key, value] of Object.entries(config)) {
        this._parseFlatConfig(value, key)
      }
    }
  }
}
