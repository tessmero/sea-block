/**
 * @file tiled-grid.ts
 *
 * Extended indexed-grid where square grid cells are
 * mapped 1-to-1 with tile shapes and positions.
 *
 * The tiling also defines adjacency between neighboring tiles.
 *
 * When a tile swaps to the opposite edge during panning,
 * it's shape and (torroidally-wrapped) adjacent neighbors
 * are assumed to be unchanged.
 *
 * Basically, tilings should be simple alternating patterns
 * and width/depth should always be even numbers.
 */
import { gridConfig } from '../configs/grid-config'
import type { TileIndex } from './indexed-grid'
import { IndexedGrid } from './indexed-grid'
import { getTiling } from './tilings/tilings-list'
import type { Tiling } from './tilings/tiling'

export interface TilePosition { x: number, z: number }

export class TiledGrid extends IndexedGrid {
  public readonly tiling: Tiling = getTiling(gridConfig.children.tiling.value)

  private readonly _midX = this.width / 2
  private readonly _midZ = this.depth / 2

  /**
   * Convert a world position (x, z) to grid coordinates (tileX, tileZ)
   * @param x The world position x coordinate.
   * @param z The world position z coordinate.
   * @returns The x and z tile indices.
   */
  positionToCoord(x: number, z: number): { x: number, z: number } {
    const { 'x': tileX, 'z': tileZ } = this.tiling.positionToIndex(
      x + this._midX,
      z + this._midZ,
    )
    return { x: tileX, z: tileZ }
  }

  indexToPosition(idx: TileIndex): TilePosition {
    const { x, z } = this.tiling.indexToPosition(idx.x, idx.z)

    const result = {
      x: -this._midX + x,
      z: -this._midZ + z,
    }

    return result
  }
}
