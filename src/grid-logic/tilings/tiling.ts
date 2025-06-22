/**
 * @file tiling.ts
 *
 * Base class for tesselations of the x/z plane.
 * Determines the position, shape, and adjacency of tiles.
 */

import { BufferGeometry } from 'three'

/*
 * tile index (integers)
 * or, tile position (floats near index)
 */
type XZ = { x: number, z: number }

export abstract class Tiling {
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

  // shape of tile
  public readonly abstract geometry: BufferGeometry

  // indices for tiles neighboring (0,0)
  public abstract getAdjacent(x: number, z: number): XZ[] // share edge
  public abstract getDiagonal(): XZ[] // share vertex
}
