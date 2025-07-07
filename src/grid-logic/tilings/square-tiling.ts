/**
 * @file square-tiling.ts
 *
 * Simplest square tiling of the grid.
 */
import { Tiling } from './tiling'

interface XZ { x: number, z: number }

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
  shapes = [{
    n: 4,
    radius: Math.sqrt(2) / 2,
    angle: Math.PI / 4,
  }]

  getShapeIndex(_x: number, _z: number) { return 0 }

  public getAdjacent() { return adjacent }
  public getDiagonal() { return diagonal }

  public positionToIndex(x: number, z: number): XZ {
    return {
      x: Math.floor(x),
      z: Math.floor(z),
    }
  }

  public indexToPosition(x: number, z: number): XZ {
    return {
      x: x + 0.5,
      z: z + 0.5,
    }
  }
}
