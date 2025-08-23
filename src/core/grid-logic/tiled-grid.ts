/**
 * @file tiled-grid.ts
 *
 * Extended indexed-grid where square grid cells are
 * mapped to tile shapes and positions based on a tiling pattern.
 *
 * The tiling also defines adjacency between neighboring tiles.
 */
import type { Spring } from '../physics/tile-sim'
import type { TileIndex } from './indexed-grid'
import { IndexedGrid } from './indexed-grid'
import type { Tiling } from './tilings/tiling'

export interface TilePosition { x: number, z: number }

export class TiledGrid extends IndexedGrid {
  private readonly _midX = this.width / 2
  private readonly _midZ = this.depth / 2

  // set when used for water or flora simulation (tile-sim.ts)
  public springsForTileSim?: ReadonlyArray<Spring>

  constructor(
    width: number,
    depth: number,
    public readonly tiling: Tiling,
  ) {
    super(width, depth)
  }

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

  public clone(): TiledGrid {
    const result = super.clone() as TiledGrid;
    (result as any).tiling = this.tiling // eslint-disable-line @typescript-eslint/no-explicit-any
    return result
  }
}
