import { GridConfig } from './grid-config'
import { TILE_DILATE } from './settings'

export class TerrainGridConfig extends GridConfig {
  private _meshScale: number = 1
  private _midX: number
  private _midZ: number

  get meshScale(): number {
    return this._meshScale
  }

  constructor(
    widthSegments: number,
    depthSegments: number,
    meshScale: number = 1,
  ) {
    super(widthSegments, depthSegments)
    this._meshScale = meshScale
    this._midX = this._meshScale * this.widthSegments / 2
    this._midZ = this._meshScale * this.depthSegments / 2
  }

  /**
   * Convert a world position (x, z) to grid coordinates (tileX, tileZ)
   */
  positionToCoord(x: number, z: number): { tileX: number, tileZ: number } {
    return {
      tileX: Math.floor((x + this._midX) / this._meshScale),
      tileZ: Math.floor((z + this._midX) / this._meshScale),
    }
  }

  /**
   * Convert grid coordinates (tileX, tileZ) to world position (x, z)
   */
  coordToPosition(tileX: number, tileZ: number): { x: number, z: number } {
    const result = {
      x: -this._midX + tileX * this._meshScale,
      z: -this._midZ + tileZ * this._meshScale,
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
