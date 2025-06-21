/**
 * @file square-tiling.ts
 *
 * Simplest square tiling of the grid.
 */
import { BoxGeometry } from 'three'
import { Tiling } from './tiling'
import { TILE_DILATE } from '../../settings'

type XZ = { x: number, z: number }

const adjacent = [
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
  { x: 0, z: -1 },
]

const diagonal = [
  { x: 1, z: 1 },
  { x: 1, z: -1 },
  { x: -1, z: 1 },
  { x: -1, z: -1 },
]

export class SquareTiling extends Tiling {
  geometry = new BoxGeometry(
    1 + TILE_DILATE,
    1,
    1 + TILE_DILATE,
  )

  public getAdjacent() { return adjacent }
  public getDiagonal() { return diagonal }

  public positionToIndex(x: number, z: number): XZ {
    return { x: Math.floor(x),
      z: Math.floor(z) }
  }

  public indexToPosition(x: number, z: number): XZ {
    return { x: x + 0.5,
      z: z + 0.5 }
  }
}
