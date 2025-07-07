/**
 * @file octagon-tiling.ts
 *
 * Regular octagon-square tiling of the grid.
 */
import { Tiling } from './tiling'

interface XZ { x: number, z: number }

// Geometric constants for octagon-square tiling
const SQ_SIDE = 1 // Side length of the squares and octagons
const OCT_SIDE = SQ_SIDE / (1 + Math.SQRT2) // Side length of octagon (so that octagon+square fits in 1x1 grid)
const OCT_RADIUS = OCT_SIDE / (2 * Math.sin(Math.PI / 8)) // Circumradius of octagon
const SQ_RADIUS = SQ_SIDE / Math.sqrt(2) / 2 // Circumradius of square

export class OctagonTiling extends Tiling {
  shapes = [
    {
      n: 8,
      radius: OCT_RADIUS * Math.SQRT2,
      angle: Math.PI / 8, // Octagon
    },
    {
      n: 4,
      radius: SQ_RADIUS * Math.SQRT2,
      angle: Math.PI / 4, // Square
    },
  ]

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
