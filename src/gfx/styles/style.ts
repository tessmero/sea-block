/**
 * @file style.ts
 *
 * Base type for visual styles.
 */

import { Color } from 'three'
import { GeneratedTile } from '../../generators/terrain-generator'

export type TileParams = {
  x: number
  z: number
  generatedTile: GeneratedTile

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
