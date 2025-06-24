/**
 * @file style.ts
 *
 * Base type for visual styles.
 */

import { Color } from 'three'
import { TerrainGenerator } from '../../generators/terrain-generator'
import { Config } from '../../configs/config'

export type TileParams = {
  x: number
  z: number
  terrainGenerator: TerrainGenerator<Config>

  // used as @condition in css
  sea?: boolean
  land?: boolean
}

export type TileStyle = {
  top: Color
  sides: Color
}

export abstract class Style {
  public abstract background: Color
  abstract getTileStyle(params: TileParams): TileStyle
}
