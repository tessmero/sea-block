/**
 * @file radial-sweep-ga.ts
 *
 * Grid animation used for flat transitions where
 * tiles cover and uncover the screen.
 */

import type { IndexedGrid, TileIndex } from '../../core/grid-logic/indexed-grid'
import { GridAnimation } from './grid-animation'

export class RadialSweepGA extends GridAnimation {
  static {
    GridAnimation.register('radial-sweep', {
      factory: () => new RadialSweepGA(),
      assertions: {

        // completely clear/cover screen at extremes
        allAtStart: 0,
        allAtEnd: 1,

        // avoid slow movements that look choppy with big pixels
        minSpeed: 3,

        // user should be able to see individual tiles morphing
        maxSpeed: 10,
      },
    })
  }

  // assigned in init
  private orderedTiles!: ReadonlyArray<TileIndex>

  init(grid: IndexedGrid) {
    const centerX = grid.width / 2
    const centerZ = grid.depth / 2

    // Order indices by increasing distance to center
    this.orderedTiles = grid.tileIndices.slice().sort((a, b) => {
      const dA = distanceSquared(a.x - centerX, a.z - centerZ)
      const dB = distanceSquared(b.x - centerX, b.z - centerZ)
      return dA - dB // nearest tiles first
    })

    super.init(grid)
  }

  protected buildTileAnim(grid: IndexedGrid, tile: TileIndex) {
    // const { i } = tile
    const i = this.orderedTiles.findIndex(oTile => oTile.i === tile.i)// this.orderedTiles[tile.i].i

    const { n } = grid

    const start0 = 0 // fist tile starts
    const start1 = 0.7 // last tile starts

    const end0 = 0.3 // fist tile finishes
    const end1 = 1 // last tile finishes

    return {
      t0: start0 + (start1 - start0) * (i / n),
      t1: end0 + (end1 - end0) * (i / n),
      val0: 0,
      val1: 1,
    }
  }
}

function distanceSquared(x: number, z: number) {
  return x * x + z * z
}
