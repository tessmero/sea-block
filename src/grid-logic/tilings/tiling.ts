/**
 * @file tiling.ts
 *
 * Base class for tesselations of the x/z plane.
 * Determines the position, shape, and adjacency of tiles.
 */

import type { TilingName } from '../../imp-names'

/*
 * tile index (integers)
 * or, tile position (floats near index)
 */
interface XZ { x: number, z: number }

// regular polygon shape
export interface TileShape {
  n: number
  radius: number
  angle: number
}

export abstract class Tiling {
  public abstract shapes: Array<TileShape>

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
  public abstract getAdjacent(x: number, z: number): Array<XZ> // share edge
  public abstract getDiagonal(x: number, z: number): Array<XZ> // share vertex

  // static registry pattern
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static _registry: Record<TilingName, () => Tiling> = {} as any

  protected constructor() {}

  static register(name: TilingName, factory: () => Tiling): void {
    if (name in this._registry) {
      throw new Error(`TerrainGenerator already registered: '${name}'`)
    }
    this._registry[name] = factory
  }

  static create(name: TilingName): Tiling {
    const factory = this._registry[name]
    if (!factory) {
      throw new Error(`tiling '${name}' not registered`)
    }
    const instance = factory()
    return instance
  }
}
