/**
 * @file terrain-generator.ts
 *
 * Base class for generators that output terrain heights.
 */

import { Color } from 'three'
import { Css } from '../gfx/styles/css-style'
import { ConfigTree } from '../configs/config-tree'
import { Configurable } from '../configurable'

export type GeneratedTile = {
  height: number
  color: Color
  isWater: boolean
}

export abstract class TerrainGenerator<T extends ConfigTree> extends Configurable<T> {
  public abstract readonly label: string
  public abstract readonly url: string
  public abstract readonly style: Css

  public abstract getTile(x: number, z: number): GeneratedTile
}
