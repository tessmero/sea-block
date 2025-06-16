export class GridConfig {
  private _widthSegments: number
  private _depthSegments: number
  private xzIndexMap: Map<string, number>
  private indexXZMap: Map<number, { x: number, z: number }>

  constructor(widthSegments: number, depthSegments: number) {
    this._widthSegments = widthSegments
    this._depthSegments = depthSegments
    this.xzIndexMap = new Map()
    this.indexXZMap = new Map()
    for (let z = 0; z < depthSegments; z++) {
      for (let x = 0; x < widthSegments; x++) {
        const index = z * widthSegments + x
        this.xzIndexMap.set(`${x},${z}`, index)
        this.indexXZMap.set(index, { x, z })
      }
    }
  }

  get widthSegments(): number {
    return this._widthSegments
  }

  get depthSegments(): number {
    return this._depthSegments
  }

  get n(): number {
    return this._widthSegments * this._depthSegments
  }

  xzToIndex(x: number, z: number): number {
    return this.xzIndexMap.get(`${x},${z}`) ?? -1
  }

  indexToXZ(index: number): { x: number, z: number } {
    return this.indexXZMap.get(index) ?? { x: -1, z: -1 }
  }

  /**
   * Update the mapping of logical (x1, z1) to new logical (x2, z2).
   * Throws if (x2, z2) already exists in the mapping.
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
    this.xzIndexMap.set(key2, idx1)
    this.indexXZMap.set(idx1, { x: x2, z: z2 })
  }

  /**
   * Generator that yields { x, z, index } for each grid cell.
   */
  * cells(): Generator<{ x: number, z: number, index: number }> {
    for (let z = 0; z < this._depthSegments; z++) {
      for (let x = 0; x < this._widthSegments; x++) {
        const index = this.xzToIndex(x, z)
        yield { x, z, index }
      }
    }
  }
}
