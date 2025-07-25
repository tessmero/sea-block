/**
 * @file triangle-tiling.ts
 *
 * Triangular grid tiling.
 */
import { Tiling } from './tiling'

interface XZ { x: number, z: number }

const TRI_SIDE = 2
const TRI_RAD = TRI_SIDE / Math.sqrt(3) // Distance from center to vertex

const TRI_HEIGHT = TRI_SIDE * Math.sqrt(3) / 2 // Height of equilateral triangle with side 1

export const TRIANGLE_TILING_SHAPES = [
  {
    n: 3,
    radius: TRI_RAD,
    angle: 0, // Upward triangle
  },
  {
    n: 3,
    radius: TRI_RAD,
    angle: Math.PI, // Downward triangle
  },
]

export class TriangleTiling extends Tiling {
  static { Tiling.register('triangle', () => new TriangleTiling()) }
  shapes = TRIANGLE_TILING_SHAPES

  // Determines if triangle is "up" or "down" based on x+z parity
  getShapeIndex(x: number, z: number) {
    return Math.abs((x + z) % 2)
  }

  public positionToIndex(x: number, z: number): XZ {
  // Estimate the x and z indices
    const xi = Math.round(x / (TRI_SIDE / 2))
    const zi = Math.round(z / TRI_HEIGHT)

    // Try both possible parities for (xi, zi)
    const candidates = [
      { x: xi, z: zi },
      { x: xi, z: zi + 1 },
      { x: xi + 1, z: zi },
      { x: xi + 1, z: zi + 1 },
    ]

    // Find the candidate whose position is closest to (x, z)
    let best = candidates[0]
    let bestDist = Infinity
    for (const c of candidates) {
      const pos = this.indexToPosition(c.x, c.z)
      const dist = Math.pow(pos.x - x, 2) + Math.pow(pos.z - z, 2)
      if (dist < bestDist) {
        best = c
        bestDist = dist
      }
    }
    return best
  }

  public indexToPosition(x: number, z: number): XZ {
    const px = x * TRI_SIDE / 2
    let pz = z * TRI_HEIGHT
    if (Math.abs(x % 2) === Math.abs(z % 2)) {
      pz -= (TRI_HEIGHT - TRI_RAD)
    }
    return { x: px, z: pz }
  }

  public getAdjacent(x: number, z: number) {
    if (Math.abs(x % 2) === Math.abs(z % 2)) {
      return adjB
    }
    else {
      return adjA
    }
  }

  public getDiagonal(x: number, z: number) {
    if (Math.abs(z % 2) === Math.abs(x % 2)) {
      return diagB
    }
    else {
      return diagA
    }
  }
}

const adjA = [
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
]
const diagA = [

  { x: 1, z: 1 },
  { x: 1, z: -1 },
  { x: -1, z: 1 },
  { x: -1, z: -1 },
  { x: 0, z: -1 },

  { x: 2, z: 0 },
  { x: 2, z: 1 },
  { x: -2, z: 0 },
  { x: -2, z: 1 },
]

const adjB = [
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: -1 },
]
const diagB = [

  { x: 1, z: 1 },
  { x: 1, z: -1 },
  { x: -1, z: 1 },
  { x: -1, z: -1 },
  { x: 0, z: 1 },

  { x: 2, z: 0 },
  { x: 2, z: -1 },
  { x: -2, z: 0 },
  { x: -2, z: -1 },

]
