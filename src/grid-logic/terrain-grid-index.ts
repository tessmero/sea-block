/**
 * @file terrain-grid-index.ts
 *
 * Extended grid index with world position information.
 */
import { GridIndex } from './grid-index'
import { TILE_DILATE } from '../settings'

export class TerrainGridIndex extends GridIndex {
  // tiles have width and depth of 1
  // just offset so (0,0) is in the middle of the starting grid
  private _midX: number = this.width / 2
  private _midZ: number = this.depth / 2

  /**
   * Convert a world position (x, z) to grid coordinates (tileX, tileZ)
   * @param x The world position x coordinate.
   * @param z The world position z coordinate.
   * @returns The x and z tile indices.
   */
  positionToCoord(x: number, z: number): { tileX: number, tileZ: number } {
    return {
      tileX: Math.floor(x + this._midX),
      tileZ: Math.floor(z + this._midX),
    }
  }

  /**
   * Convert grid coordinates (tileX, tileZ) to world position (x, z)
   * @param tileX The tile x-index.
   * @param tileZ The tile z-index.
   * @returns The x and z absolute world position coordinates.
   */
  coordToPosition(tileX: number, tileZ: number): { x: number, z: number } {
    const result = {
      x: -this._midX + tileX,
      z: -this._midZ + tileZ,
    }

    // adjust every other tile to prevent two adjacent faces from aligning perfectly
    // so we have the option to overlap them without flickering
    if ((tileX % 2) === (tileZ % 2)) {
      result.x += TILE_DILATE / 2
      result.z += TILE_DILATE / 2
    }

    return result
  }
}
