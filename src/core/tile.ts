/**
 * @file tile.ts
 *
 * A square terrain tile (water or solid).
 */
import type { Vector3 } from 'three'

export interface Tile {
  position: Vector3
  height: number
  normal: Vector3

  isVisible: boolean
  isWater: boolean
  isFlora: boolean
}
