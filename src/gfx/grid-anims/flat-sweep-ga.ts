/**
 * @file flat-sweep-ga.ts
 *
 * Grid animation used for flat transitions where
 * tiles cover and uncover the screen.
 */

import type { IndexedGrid, TileIndex } from '../../core/grid-logic/indexed-grid'
import { GridAnimation } from './grid-animation'

export class FlatSweepGA extends GridAnimation {
  static {
    GridAnimation.register('flat-sweep', {
      factory: () => new FlatSweepGA(),
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

  protected buildTileAnim(grid: IndexedGrid, tile: TileIndex) {
    const { i } = tile
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
