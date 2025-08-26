/**
 * @file raft-hl-tiles.ts
 *
 * Raft highlighted tiles. Determines which tiles are highlighted when building raft.
 */

import type { TileColors } from 'gfx/styles/style'
import { raft, RAFT_MAX_RAD } from './raft'
import { Color } from 'three'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { isBuildable } from './raft-building-rules'
import type { PieceName } from './raft-enums'
import { hideRaftBuildables, showRaftBuildables } from './raft-gfx-helper'

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
    hideRaftBuildables()
    this.hovered = undefined
  }

  // co-opt buildable highlight to show possible connections for button
  highlightThrusters() {
    this.buildable.clear()
    for (const at of raft.thrusters) {
      const piece = raft.raftPieces[at.pieceIndex]
      this.buildable.add(piece.tile.i)
    }
    showRaftBuildables()
  }

  updateBuildableTiles(piece: PieceName) {
    const { x, z } = raft.centerTile
    const { grid } = raft
    this.buildable.clear()

    // iterate over tiles in bounds
    for (let dx = -RAFT_MAX_RAD; dx <= RAFT_MAX_RAD; dx++) {
      for (let dz = -RAFT_MAX_RAD; dz <= RAFT_MAX_RAD; dz++) {
        const tile = grid.xzToIndex(x + dx, z + dz)
        if (tile && isBuildable(piece, tile)) {
          this.buildable.add(tile.i)
        }
      }
    }

    showRaftBuildables()
  }
}

// function isBuildable(tile: TileIndex, grid: TiledGrid, raftTiles: Set<number>): boolean {
//   if (raftTiles.has(tile.i)) {
//     return false // tile is occupied
//   }
//   // iterate over adjacent neighbors
//   for (const { x, z } of grid.tiling.getAdjacent(tile.x, tile.z)) {
//     const adjTile = grid.xzToIndex(tile.x + x, tile.z + z)
//     if (adjTile && raftTiles.has(adjTile.i)) {
//       // tile has existing raft piece as neighbor so it is buildable
//       return true
//     }
//   }
//   return false
// }

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
