/**
 * @file grid-index.ts
 *
 * Relates two sets of logical indices for a grid of tiles.
 *
 * 1. The x/z tile coordinates, integers related to position in world.
 * 2. The flat indices from 0 to n-1, used as index for TileGroup.
 */
export class GridIndex {
  public readonly n: number

  private xzIndexMap: Map<string, number> = new Map()

  private indexXZMap: Map<number, { x: number
    z: number }> = new Map()

  constructor(
    public readonly width: number,
    public readonly depth: number,
  ) {
    this.n = width * depth

    // iterate over grid cells
    for (let z = 0; z < this.depth; z++) {
      for (let x = 0; x < this.width; x++) {
        const index = z * this.width + x

        // add cell to indices
        this.xzIndexMap.set(
          `${x},${z}`,
          index,
        )
        this.indexXZMap.set(
          index,
          { x,
            z },
        )
      }
    }
  }

  xzToIndex(x: number, z: number): number {
    return this.xzIndexMap.get(`${x},${z}`) ?? -1
  }

  indexToXZ(index: number): { x: number
    z: number } {
    return this.indexXZMap.get(index) ?? { x: -1,
      z: -1 }
  }

  /**
   * Update the mapping of logical (x1, z1) to new logical (x2, z2).
   * Throws if (x2, z2) already exists in the mapping.
   * @param x1 The existing x-index.
   * @param z1 The existing z-index.
   * @param x2 The new x-index.
   * @param z2 The new z-index.
   */
  updateMapping(x1: number, z1: number, x2: number, z2: number) {
    const key1 = `${x1},${z1}`
    const key2 = `${x2},${z2}`
    const idx1 = this.xzIndexMap.get(key1)

    if (idx1 === undefined) throw new Error(`Invalid coordinates: (${x1}, ${z1}) not found`)
    if (this.xzIndexMap.has(key2)) throw new Error(`Target coordinates (${x2}, ${z2}) already mapped`)

    // Remove old mapping
    this.xzIndexMap.delete(key1)
    // Add new mapping
    this.xzIndexMap.set(
      key2,
      idx1,
    )
    this.indexXZMap.set(
      idx1,
      { x: x2,
        z: z2 },
    )
  }

  /**
   * Generator that yields { x, z, index } for each grid cell.
   * @yields The x,z coordinates and flat index.
   */
  * cells(): Generator<{ x: number, z: number, index: number }> {
    for (let i = 0; i < this.n; i++) {
      yield { index: i,
        ...this.indexToXZ(i) }
    }
  }
}
