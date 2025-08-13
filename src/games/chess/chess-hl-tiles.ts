/**
 * @file chess-hl-tiles.ts
 *
 * Chess highlighted tiles. Manages color-overrides
 * for terrain tiles used as chess board.
 */

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { TileGroup } from 'core/groups/tile-group'
import { getAllowedMoves } from './chess-rules'
import type { Chess } from './chess-helper'

const _HIGHLIGHTS = [
  'hover', 'hold', 'allowedMove',
] as const
export type ChessTileHighlight = (typeof _HIGHLIGHTS)[number]

export class ChessHlTiles {
  public allowedMoves: Set<number> = new Set()
  public hovered: TileIndex | undefined = undefined

  constructor(
    private readonly terrain: TileGroup,
  ) {}

  updateAllowedMoves(chess: Chess) {
    const {
      currentPhase: phase,
      centerTile: center,
      player: piece,
    } = chess
    const { terrain, allowedMoves } = this

    // clear old highlights
    allowedMoves.clear()

    if (phase === 'place-pawn') {
      // highlight bottom row
      const { x, z } = center
      for (let dx = -2; dx <= 2; dx++) {
        const tile = terrain.grid.xzToIndex(x + dx, z + 2)
        if (tile && !chess.getPieceOnTile(tile)) {
          allowedMoves.add(tile.i)
        }
      }
    }
    else {
      // highlight allowed moves
      const targets = getAllowedMoves({ type: piece.type, tile: piece.tile, terrain, chess })
      for (const tile of targets) {
        const occupant = chess.getPieceOnTile(tile)
        if (!occupant || occupant.isEnemy) {
          allowedMoves.add(tile.i)
        }
      }
    }
  }
}
