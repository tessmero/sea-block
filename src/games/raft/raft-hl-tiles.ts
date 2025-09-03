/**
 * @file raft-hl-tiles.ts
 *
 * Raft highlighted tiles. Determines which tiles are clickable in current raft phase.
 */

import { raft, RAFT_MAX_RAD } from './raft'
import { isBuildable } from './raft-building-rules'
import type { PieceName } from './raft-enums'
import { hideRaftClickables, showRaftClickables } from './gfx/raft-clickable-highlight'

export class RaftHlTiles {
  public readonly clickable: Set<number> = new Set()

  clear() {
    this.clickable.clear() // update logical
    hideRaftClickables() // update gfx
  }

  // show possible connections for button
  highlightThrusters() {
    this.clickable.clear()
    for (const at of raft.thrusters) {
      const piece = raft.raftPieces[at.pieceIndex]
      this.clickable.add(piece.tile.i)
    }
    showRaftClickables() // update gfx
  }

  // show tiles where given piece can be built
  updateBuildableTiles(piece: PieceName) {
    const { x, z } = raft.centerTile
    const { grid } = raft
    this.clickable.clear()

    // iterate over tiles in bounds
    for (let dx = -RAFT_MAX_RAD; dx <= RAFT_MAX_RAD; dx++) {
      for (let dz = -RAFT_MAX_RAD; dz <= RAFT_MAX_RAD; dz++) {
        const tile = grid.xzToIndex(x + dx, z + dz)
        if (tile && isBuildable(piece, tile)) {
          this.clickable.add(tile.i)
        }
      }
    }

    showRaftClickables() // update gfx
  }
}
