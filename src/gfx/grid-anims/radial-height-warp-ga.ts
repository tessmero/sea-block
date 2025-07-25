/**
 * @file radial-height-warp-ga.ts
 *
 * Grid animation used for start sequence, where
 * tile heights are offset to form a spherical shape.
 */

import type { IndexedGrid, TileIndex } from '../../core/grid-logic/indexed-grid'
import { GridAnimation } from './grid-animation'

export class RadialHeightWarpGA extends GridAnimation {
  static {
    GridAnimation.register('radial-height-warp', {
      factory: () => new RadialHeightWarpGA(),
      assertions: {

        // must be possible to reduce effect to zero for all tiles
        allAtStart: 0,

        // must change gradually
        maxSpeed: 10,
      },
    })
  }

  protected buildTileAnim(grid: IndexedGrid, tile: TileIndex) {
    const { x, z } = tile
    const radius = Math.sqrt(x * x + z * z)

    return {
      t0: 0,
      t1: 1,
      val0: 0,
      val1: radius / 10,
    }
  }
}
