/**
 * @file tile.ts
 *
 * A square terrain tile (water or solid).
 */
import { Vector3 } from 'three'

export type Tile = {
  position: Vector3
  height: number
  normal: Vector3

  isWater: boolean
}
