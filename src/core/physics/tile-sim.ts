/**
 * @file tile-sim.ts
 *
 * Base class for tile-based simulations (water and flora).
 */
import type { TiledGrid } from '../grid-logic/tiled-grid'
import type { Tile } from '../tile'
import { Simulation } from './simulation'

// a spring between neighboring tiles
export interface Spring {
  indexA: number // flat tile index
  indexB: number
  weight: number // relative strength (<1 for diagonal)
}

export abstract class TileSim extends Simulation<Tile> {
  protected readonly n: number // total tiles in grid

  // springs connecting all neighbors with opposite edges wrapped
  protected readonly springs: ReadonlyArray<Spring>

  constructor(protected readonly grid: TiledGrid) {
    super()
    this.springs = getGridSprings(grid)
    this.n = grid.n
  }
}

function getGridSprings(grid: TiledGrid): ReadonlyArray<Spring> {
  // avoid building springs multiple times
  if (!grid.springsForTileSim) {
    grid.springsForTileSim = buildGridSprings(grid)
  }
  return grid.springsForTileSim
}

// connect all neighboring tiles and wrap opposite edges
function buildGridSprings(grid: TiledGrid): ReadonlyArray<Spring> {
  const lowWeight = 1 / Math.SQRT2

  const { width, depth } = grid
  const springs: Array<Spring> = []
  for (const { x, z, i: index } of grid.tileIndices) {
    const springSpecs: Array<Array<number>> = [
      ...grid.tiling.getAdjacent(x, z).map(({ x, z }) => [x, z, 1]),
      ...grid.tiling.getDiagonal(x, z).map(({ x, z }) => [x, z, lowWeight]),
    ]

    for (const [dx, dz, weight] of springSpecs) {
      // get wrapped neighbor coords
      const wrappedX = (x + dx + width) % width
      const wrappedZ = (z + dz + depth) % depth
      const neighborIdx = grid.xzToIndex(wrappedX, wrappedZ)
      if (!neighborIdx) {
        throw new Error(`initial grid is missing tile (${wrappedX},${wrappedZ})`)
      }
      const indexB = neighborIdx.i

      if (index < indexB) { // prevent duplicating
        springs.push({ indexA: index, indexB, weight })
      }
    }
  }
  return springs as ReadonlyArray<Spring>
}
