/**
 * @file style.ts
 *
 * Base type for visual styles.
 */

import type { Color } from 'three'
import type { GeneratedTile } from '../../generators/terrain-generator'
import type { TileExt } from '../tile-mesh'

export interface TileParams {
  x: number
  z: number
  generatedTile: GeneratedTile

  // used as @condition in css
  sea?: boolean // eslint-disable-line @typescript-eslint/naming-convention
  land?: boolean // eslint-disable-line @typescript-eslint/naming-convention
}

// style for one tile = color for each part of extruded tile
export type TileStyle = Record<keyof TileExt, Color>

export abstract class Style {
  public abstract background: Color
  abstract getTileStyle(params: TileParams): TileStyle
}
