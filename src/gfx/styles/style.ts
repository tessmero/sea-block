/**
 * @file style.ts
 *
 * Base type for visual styles.
 */

import type { Color } from 'three'
import type { GeneratedTile } from '../../generators/terrain-generator'
import type { CompositeStyle } from '../composite-element'
import type { TilePart } from '../3d/tile-mesh'

// tile-specific params needed to pick colors
export interface TileParams {
  x: number
  z: number
  generatedTile: GeneratedTile

  // used as @condition in css
  sea?: boolean // eslint-disable-line @typescript-eslint/naming-convention
  land?: boolean // eslint-disable-line @typescript-eslint/naming-convention

  specialState?: 'start-sequence' | undefined
}

// colors for a tile
export type TileStyle = CompositeStyle<TilePart>

export abstract class Style {
  public abstract background: Color
  abstract getTileStyle(params: TileParams): TileStyle
}
