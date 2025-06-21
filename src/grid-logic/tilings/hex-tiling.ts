/**
 * @file hex-tiling.ts
 *
 * Hexagonal grid tiling.
 */
import { CylinderGeometry } from 'three'
import { Tiling } from './tiling'
import { TILE_DILATE } from '../../settings'

type XZ = { x: number, z: number }

// For flat-topped hex, width across flats is 1, so radius is 0.5
const radius = 0.5

const evenAdj = [
  { x: 1, z: 0 },
  { x: 0, z: -1 },
  { x: -1, z: -1 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
  { x: 1, z: -1 },
]

const oddAdj = [
  { x: 1, z: 0 },
  { x: 0, z: -1 },
  { x: 1, z: 1 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
  { x: -1, z: 1 },
]

export class HexTiling extends Tiling {
  geometry = new CylinderGeometry(
    radius * (1 + TILE_DILATE), // radiusTop
    radius * (1 + TILE_DILATE), // radiusBottom
    1, // height (Y axis)
    6, // radialSegments (hexagon)
  ).rotateY(Math.PI / 6) // Rotate so it's flat-topped

  public getAdjacent(parity: boolean) {
    return parity ? oddAdj : evenAdj
  }

  public getDiagonal() { return [] }

  // Convert world position to offset coordinates (col, row)
  public positionToIndex(x: number, z: number): XZ {
    const col = Math.round(x / (3 / 2 * radius))
    const row = Math.round(z / (Math.sqrt(3) * radius) - 0.5 * (col & 1))
    return { x: col,
      z: row }
  }

  // Convert offset coordinates (col, row) to world position
  public indexToPosition(col: number, row: number): XZ {
    return {
      x: 3 / 2 * radius * col,
      z: Math.sqrt(3) * radius * (row + 0.5 * (col & 1)),
    }
  }
}
