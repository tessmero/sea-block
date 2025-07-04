/**
 * @file indexed-grid.ts
 *
 * Relates two sets of logical indices for a grid of tiles.
 *
 * 1. The x/z tile coordinates, integers related to position in world.
 * 2. The flat indices from 0 to n-1, used as index for TileGroup.
 */

// a single tile
export type TileIndex = {

  // constant flat index
  i: number

  // woorld position in units of tiles
  x: number
  z: number
}

// tile with locked flat index
class LockedTileIndex implements TileIndex {
  constructor(public readonly i, public x, public z) {}
}

export class IndexedGrid {
  public readonly n: number // total tiles in panning region

  // used to lookup tiles by x/z
  private readonly xzIndexMap: Map<number, Map<number, TileIndex>>

  public readonly tileIndices: TileIndex[] // tiles by flat index

  constructor(
    public readonly width: number,
    public readonly depth: number,
  ) {
    this.n = width * depth

    let i = 0
    this.tileIndices = []
    this.xzIndexMap = new Map()

    // build all tile indices
    for (let x = 0; x < this.width; x++) {
      this.xzIndexMap.set(x, new Map())
      for (let z = 0; z < this.depth; z++) {
        const ti = new LockedTileIndex(i++, x, z)
        this.xzIndexMap.get(x).set(z, ti)
        this.tileIndices.push(ti)
      }
    }
  }

  xzToIndex(x: number, z: number): TileIndex {
    if (!this.xzIndexMap.has(x)) {
      return null
    }
    return this.xzIndexMap.get(x).get(z)
  }

  // move tile (new position should be on opposite side of grid)
  updateMapping(idx: TileIndex, newX: number, newZ: number) {
    const map = this.xzIndexMap

    // remove old mapping
    const oldX = idx.x
    const oldZ = idx.z
    const oldSubMap = map.get(oldX)
    oldSubMap.delete(oldZ)
    if (oldSubMap.size === 0) {
      map.delete(oldX)
    }

    // modify tile index
    idx.x = newX
    idx.z = newZ

    // add new mapping
    if (!map.has(newX)) {
      map.set(newX, new Map())
    }
    map.get(newX).set(newZ, idx)
  }
}
