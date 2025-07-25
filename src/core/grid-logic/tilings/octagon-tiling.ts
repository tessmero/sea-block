/**
 * @file octagon-tiling.ts
 *
 * Regular octagon-square tiling of the grid.
 */
import { Tiling } from './tiling'

interface XZ { x: number, z: number }

// compute circumradius so neighboring octagons' centers are sqrt2 apart
const octagonRadius = (Math.SQRT2) / (2 * (1 + Math.SQRT2) * Math.sin(Math.PI / 8))

// compute smaller circumradius for square tiles
const squareRadius = (
  2 - 2 * octagonRadius // space between octagons
) * Math.cos(Math.PI / 8)

export const OCTAGON_TILING_SHAPES = [
  {
    n: 8,
    radius: octagonRadius,
    angle: Math.PI / 8, // Octagon
  },
  {
    n: 4,
    radius: squareRadius,
    angle: Math.PI / 4, // Square
  },
]

export class OctagonTiling extends Tiling {
  static { Tiling.register('octagon', () => new OctagonTiling()) }

  shapes = OCTAGON_TILING_SHAPES

  getShapeIndex(x: number, z: number) {
    return Math.abs((x + z) % 2)
  }

  public positionToIndex(x: number, z: number): XZ {
    return {
      x: Math.round(x),
      z: Math.round(z),
    }
  }

  public indexToPosition(x: number, z: number): XZ {
    return { x: x, z: z }
  }

  public getAdjacent(x: number, z: number) {
    const isSquare = Math.abs((x + z) % 2) === 1

    if (isSquare) {
      return squareAdj
    }
    else {
      return octAdj
    }
  }

  public getDiagonal(_x: number, _z: number) {
    return []
  }
}

const squareAdj = [
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
  { x: 0, z: -1 },
]

const octAdj = [
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
  { x: 0, z: -1 },
  { x: 1, z: 1 },
  { x: 1, z: -1 },
  { x: -1, z: 1 },
  { x: -1, z: -1 },
]
