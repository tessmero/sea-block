/**
 * @file grid-animation.ts
 *
 * Base class to help with 2D and 3D visual effects involving grids.
 *
 * Grid animations take animation state (0-1) and output a 1D
 * state for each grid tile (e.g. y-offset for each tile).
 *
 * All grid animations work by interpolating between
 * pre-computed extreme values for each tile.
 */

import type { GridAnimName } from '../../imp-names'
import type { IndexedGrid, TileIndex } from '../../core/grid-logic/indexed-grid'

// pre-computed extremes for one tile in the grid
type TileAnimation = {
  t0: number // 0 (increase to wait at start)
  t1: number // 1 (decrease to reach end early)
  val0: number // value at (0 to startTime)
  val1: number // value at (endTime to 1)
}

// object that subclassese should pass to register()
interface RegisteredGA {
  readonly factory: () => GridAnimation
  readonly assertions: { // assertions for unit test
    allAtStart?: number // all tiles will have this value at t=0
    allAtEnd?: number // all tile will have this value at t=1

    // limit rate of change (delta value / delta t)
    minSpeed?: number
    maxSpeed: number // required
  }
}

export abstract class GridAnimation {
  private tileAnims!: ReadonlyArray<TileAnimation> // assigned in create

  // compute extremes for one tile, called in create
  protected abstract buildTileAnim(grid: IndexedGrid, tile: TileIndex)

  // get interpolated value for tile at time (0-1)
  public getTileValue(tile: TileIndex, time: number) {
    // if (tile.i > this.tileAnims.length) {
    //   throw new Error(`grid animation init with n-${this.initGrid.n}, now tile has i=${tile.i}`)
    // }
    const { t0, t1, val0, val1 } = this.tileAnims[tile.i % this.tileAnims.length]
    const r = Math.max(0, Math.min(1, (time - t0) / (t1 - t0)))
    return val0 + r * (val1 - val0)
  }

  private initGrid!: IndexedGrid

  public init(grid: IndexedGrid) {
    this.initGrid = grid
    const anims: Array<TileAnimation> = []
    for (const tile of grid.tileIndices) {
      anims.push(this.buildTileAnim(grid, tile))
      // anims.push({
      //   startTime: 0,
      //   endTime: 1,
      //   startValue: 0,
      //   endValue: 1,
      // })
    }
    this.tileAnims = anims as ReadonlyArray<TileAnimation>
  }

  // static registry pattern
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static _registry: Record<GridAnimName, RegisteredGA> = {} as any

  protected constructor() {}

  static register(name: GridAnimName, rga: RegisteredGA): void {
    // console.log(`register grid anim ${name}`)
    if (name in this._registry) {
      throw new Error(`grid anim already registered: '${name}'`)
    }
    this._registry[name] = rga
  }

  static create(name: GridAnimName, grid: IndexedGrid): GridAnimation {
    if (!(name in this._registry)) {
      throw new Error(`grid anim not registered: ${name}: ${JSON.stringify(Object.keys(this._registry))}`)
    }

    const { factory } = this._registry[name]
    const instance = factory()

    // GridAnimation
    // post-construction setup
    instance.init(grid)

    return instance
  }
}
