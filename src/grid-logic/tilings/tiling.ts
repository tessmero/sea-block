/**
 * @file tiling.ts
 *
 * Base class for tesselations of the x/z plane.
 * Determines the position, shape, and adjacency of tiles.
 */

import { BufferGeometry, CylinderGeometry } from 'three'
import { TILE_DILATE } from '../../settings'

/*
 * tile index (integers)
 * or, tile position (floats near index)
 */
type XZ = { x: number, z: number }

// regular polygon parameters
export type TileShape = {
  n: number
  radius: number
  angle: number
}

export abstract class Tiling {
  public abstract shapes: TileShape[]

  // pick shape for tile index
  public abstract getShapeIndex(x: number, z: number): number

  /**
   * called in grid-layout
   * get tile index at position
   */
  public abstract positionToIndex(x: number, z: number): XZ

  /**
   * called in grid-layout.js
   * get position for tile index
   */
  public abstract indexToPosition(x: number, z: number): XZ

  // get relative indices for tile neighbors
  public abstract getAdjacent(x: number, z: number): XZ[] // share edge
  public abstract getDiagonal(x: number, z: number): XZ[] // share vertex

  public getGeometries(): BufferGeometry[] {
    return this.shapes.map(({ n, radius, angle }) => new CylinderGeometry(
      radius * (1 + TILE_DILATE),
      radius * (1 + TILE_DILATE),
      1, n,
    ).rotateY(angle))
  }
}
