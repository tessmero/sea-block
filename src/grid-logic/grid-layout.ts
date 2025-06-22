/**
 * @file grid-layout.ts
 *
 * Extended grid index with world position information.
 */
import { GridIndex } from './grid-index'
import { TILE_DILATE } from '../settings'
import { BufferGeometry } from 'three'
import { gridConfig } from '../configs/grid-config'
import { getTiling } from './tilings/tiling-util'
import { Tiling } from './tilings/tiling'

type XZ = { x: number, z: number }

export class GridLayout extends GridIndex {
  private readonly _midX = this.width / 2
  private readonly _midZ = this.depth / 2
  public readonly tiling: Tiling = getTiling(gridConfig.params.tiling.value)

  get geometry(): BufferGeometry {
    return this.tiling.geometry
  }

  getAdjacent(x: number, z: number): XZ[] {
    return this.tiling.getAdjacent(x, z)
  }

  getDiagonal(): XZ[] {
    return this.tiling.getDiagonal()
  }

  /**
   * Convert a world position (x, z) to grid coordinates (tileX, tileZ)
   * @param x The world position x coordinate.
   * @param z The world position z coordinate.
   * @returns The x and z tile indices.
   */
  positionToCoord(x: number, z: number): { tileX: number
    tileZ: number } {
    const { 'x': tileX, 'z': tileZ } = this.tiling.positionToIndex(
      x + this._midX,
      z + this._midZ,
    )
    return { tileX,
      tileZ }
  }

  /**
   * Convert grid coordinates (tileX, tileZ) to world position (x, z)
   * @param tileX The tile x-index.
   * @param tileZ The tile z-index.
   * @returns The x and z absolute world position coordinates.
   */
  coordToPosition(tileX: number, tileZ: number): { x: number
    z: number } {
    const { x, z } = this.tiling.indexToPosition(tileX, tileZ)

    const result = {
      x: -this._midX + x,
      z: -this._midZ + z,
    }

    /*
      * adjust every other tile to prevent two adjacent faces from aligning perfectly
      * so we have the option to overlap them without flickering
      */
    if (tileX % 2 === tileZ % 2) {
      result.x += TILE_DILATE / 2
      result.z += TILE_DILATE / 2
    }

    return result
  }
}
