/**
 * @file style.ts
 *
 * Base type for visual styles.
 *
 * Currently styles only effect tiles and background.
 */

import type { GeneratedTile } from '../../generators/terrain-generator'
import type { TilePart } from '../3d/tile-mesh'
import type { CompositeColors } from '../composite-element'

// tile-specific parameters to pass to style
export interface TileColoringParams {
  x: number
  z: number
  generatedTile: GeneratedTile

  // support @sea and @land conditions in css
  sea?: boolean // eslint-disable-line @typescript-eslint/naming-convention
  land?: boolean // eslint-disable-line @typescript-eslint/naming-convention
}

// colors for each part of a tile
export type TileColors = CompositeColors<TilePart>
