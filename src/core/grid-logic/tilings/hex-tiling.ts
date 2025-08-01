/**
 * @file hex-tiling.ts
 *
 * Hexagonal grid tiling.
 */
import { Tiling } from './tiling'

interface XZ { x: number, z: number }

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

const radius = Math.sqrt(3) / 2

export const HEX_TILING_SHAPES = [{
  n: 6,
  radius,
  angle: Math.PI / 6,
}]

export class HexTiling extends Tiling {
  static { Tiling.register('hex', () => new HexTiling()) }

  shapes = HEX_TILING_SHAPES

  getShapeIndex(_x: number, _z: number) { return 0 }

  public getAdjacent(x: number, _z: number) {
    if (Math.abs(x) % 2 === 1) {
      return oddAdj
    }
    else {
      return evenAdj
    }
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
