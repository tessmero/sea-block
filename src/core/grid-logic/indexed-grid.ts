/**
 * @file indexed-grid.ts
 *
 * Relates two sets of logical indices for a grid of tiles.
 *
 * 1. The x/z tile coordinates, integers related to position in world.
 * 2. The flat indices from 0 to n-1, used as index for TileGroup members.
 *
 * The grid has a limited width/depth but can be panned to any x/z location.
 * When we pan the grid, some tiles are moved to the opposite edge.
 */

// a single tile in terms of integers
export interface TileIndex {

  // constant flat index
  readonly i: number

  // world position in units of tiles
  x: number
  z: number
}

// rectangular grid of tiles
export class IndexedGrid {
  public readonly n: number // total tiles in panning region

  // tiles by flat index
  public readonly tileIndices: ReadonlyArray<TileIndex>

  // used to lookup tiles by x/z
  private readonly xzIndexMap: Map<number, Map<number, TileIndex>>

  constructor(
    public readonly width: number,
    public readonly depth: number,
  ) {
    this.n = width * depth

    let i = 0
    const tileIndices: Array<TileIndex> = []
    this.xzIndexMap = new Map()

    // build all tile indices
    for (let x = 0; x < this.width; x++) {
      const xMap = new Map()
      this.xzIndexMap.set(x, xMap)
      for (let z = 0; z < this.depth; z++) {
        const ti: TileIndex = { i: i++, x, z }
        xMap.set(z, ti)
        tileIndices.push(ti)
      }
    }
    this.tileIndices = tileIndices
  }

  xzToIndex(x: number, z: number): TileIndex | undefined {
    if ((x % 1) !== 0 || (z % 1) !== 0) {
      throw new Error(`invalid tile x/z index (${x},${z}). must be integers.`)
    }
    const xMap = this.xzIndexMap.get(x)
    if (xMap) {
      return xMap.get(z)
    }
    return undefined
  }

  // move tile (new position should be on opposite side of grid)
  updateMapping(idx: TileIndex, newX: number, newZ: number) {
    if ((newX % 1) !== 0 || (newZ % 1) !== 0) {
      throw new Error(`invalid tile x/z index (${newX},${newZ}). must be integers.`)
    }

    const map = this.xzIndexMap

    // remove old mapping
    const oldX = idx.x
    const oldZ = idx.z
    if (!map.has(oldX)) {
      throw new Error('old mapping not valid')
    }
    const oldSubMap = map.get(oldX)
    oldSubMap!.delete(oldZ)
    if (oldSubMap!.size === 0) {
      map.delete(oldX)
    }

    // modify tile index
    idx.x = newX
    idx.z = newZ

    // add new mapping
    if (!map.has(newX)) {
      map.set(newX, new Map())
    }
    map.get(newX)!.set(newZ, idx)
  }
}
