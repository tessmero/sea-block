/**
 * @file terrain-generator.ts
 *
 * Base class for generators that output terrain heights.
 */

import { Color } from 'three'
import { Css } from '../gfx/styles/css-style'
import { ConfigView } from '../configs/config-view'
import { ConfigTree } from '../configs/config-tree'

export type GeneratedTile = {
  height: number
  color: Color
  isWater: boolean
}

export abstract class TerrainGenerator {
  public abstract readonly label: string
  public abstract readonly url: string
  public abstract readonly config?: ConfigView<ConfigTree>
  public abstract readonly style: Css

  public refreshConfig(): void {
    if (this.config) this.config.updateFlatValues()
  }

  public abstract getTile(x: number, z: number): GeneratedTile
}
