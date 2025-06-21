/**
 * @file triangle-tiling.ts
 *
 * Equilateral triangle tiling.
 */
import { CylinderGeometry } from 'three'
import { Tiling } from './tiling'

type XZ = { x: number, z: number }

// For equilateral triangle, side length = 1, height = sqrt(3)/2
const radius = 1 / Math.sqrt(3) // Circumradius for side=1

const adjacent = [
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
]

const diagonal = [
  { x: 1, z: 1 },
  { x: -1, z: 1 },
  { x: 0, z: -1 },
]

export class TriangleTiling extends Tiling {
  geometry = new CylinderGeometry(
    radius, // radiusTop
    radius, // radiusBottom
    1, // height (Y axis)
    3, // radialSegments (triangle)
  )

  public getRotation(parity: boolean): number {
    return parity ? -Math.PI / 2 : Math.PI / 2 // Make one vertex point "up"
  }

  public getAdjacent() { return adjacent }
  public getDiagonal() { return diagonal }

  // Convert world position to triangle grid index (col, row)
  public positionToIndex(x: number, z: number): XZ {
    // Triangle width = 1, height = sqrt(3)/2
    const triHeight = Math.sqrt(3) / 2
    const col = Math.floor(x + 0.5)
    const row = Math.floor(z / triHeight + 0.5)
    return { x: col,
      z: row }
  }

  // Convert grid index (col, row) to world position (center of triangle)
  public indexToPosition(col: number, row: number): XZ {
    // Even rows are "up", odd rows are "down"
    const triHeight = Math.sqrt(3) / 2
    return {
      x: col,
      z: row * triHeight + (col % 2 ? 0.5 : 0),
    }
  }
}
