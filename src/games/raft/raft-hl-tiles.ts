/**
 * @file raft-hl-tiles.ts
 *
 * Raft highlighted tiles. Determines which tiles are highlighted in raft-build.
 */

import type { TileColors } from 'gfx/styles/style'
import type { Raft } from './raft'
import { RAFT_MAX_RAD } from './raft'
import { Color } from 'three'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { TiledGrid } from 'core/grid-logic/tiled-grid'

const _HIGHLIGHTS = [
  'buildable',
  'hover',
] as const
export type RaftTileHighlight = (typeof _HIGHLIGHTS)[number]

export class RaftHlTiles {
  public readonly buildable: Set<number> = new Set()
  public hovered?: TileIndex

  public static pickColorsForTile(hl: RaftTileHighlight) {
    return hlColors[hl]
  }

  clear() {
    this.buildable.clear()
    this.hovered = undefined
  }

  updateBuildableTiles(raft: Raft) {
    const { x, z } = raft.centerTile
    const { grid } = raft.context.terrain
    this.buildable.clear()

    // iterate over tiles in bounds
    for (let dx = -RAFT_MAX_RAD; dx <= RAFT_MAX_RAD; dx++) {
      for (let dz = -RAFT_MAX_RAD; dz <= RAFT_MAX_RAD; dz++) {
        const tile = grid.xzToIndex(x + dx, z + dz)
        if (tile && isBuildable(tile, grid, raft.raftTiles)) {
          this.buildable.add(tile.i)
        }
      }
    }
  }
}

function isBuildable(tile: TileIndex, grid: TiledGrid, raftTiles: Set<number>): boolean {
  if (raftTiles.has(tile.i)) {
    return false // tile is occupied
  }
  // iterate over adjacent neighbors
  for (const { x, z } of grid.tiling.getAdjacent(tile.x, tile.z)) {
    const adjTile = grid.xzToIndex(tile.x + x, tile.z + z)
    if (adjTile && raftTiles.has(adjTile.i)) {
      // tile has existing raft piece as neighbor so it is buildable
      return true
    }
  }
  return false
}

const hlColors: Record<RaftTileHighlight, TileColors> = {
  buildable: {
    top: new Color('#41BB6E'),
    sides: new Color('#379247'),
  },
  hover: {
    top: new Color('#B3CFFF'),
    sides: new Color('#7FA7E0'),
  },
}
