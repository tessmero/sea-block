/**
 * @file pipeline.ts
 *
 * Steps to compute the target height and color of a terrain tile.
 */

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { TileGroup } from 'core/groups/tile-group'
import type { StyleParser } from 'util/style-parser'
import type { TileColors } from 'gfx/styles/style'

export type Pipeline = {
  update: (dt: number) => void // called once per frame
  steps: Array<Step>
}

// return modified values or cancel pipeline
export type Step = (params: Params) => TileValues | null

// arguments for each step
type Params = {
  group: TileGroup
  style: StyleParser
  tileIndex: TileIndex
  current: TileValues // values from previous step in pipeline
}

// values for one tile
export type TileValues = {
  height: number
  yOffset: number
  targetColors?: TileColors
  isWater?: boolean
  isFlora?: boolean
  isVisible?: boolean
}
