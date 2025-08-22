/**
 * @file chess-hl-tiles.ts
 *
 * Chess highlighted tiles. Determines which tiles are highlighted on the chess board.
 */

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { canLandOn, getAllowedMoves } from './chess-rules'
import type { Chess } from './chess-helper'

const _HIGHLIGHTS = [
  'hover', 'hold', 'allowedMove', 'enemyMove',
] as const
export type ChessTileHighlight = (typeof _HIGHLIGHTS)[number]

export class ChessHlTiles {
  public allowedMoves: Set<number> = new Set()
  public hovered: TileIndex | undefined = undefined

  updateAllowedMoves(chess: Chess) {
    const {
      currentPhase: phase,
      centerTile: center,
      player: piece,
    } = chess
    const { allowedMoves } = this
    const { terrain } = chess.context

    // clear old highlights
    allowedMoves.clear()

    if (phase === 'place-pawn') {
      // highlight bottom row
      const { x, z } = center
      for (let dx = -2; dx <= 2; dx++) {
        const tile = terrain.grid.xzToIndex(x + dx, z + 2)
        if (tile && canLandOn(tile, { type: 'pawn', tile, chess, terrain }) && !chess.getPieceOnTile(tile)) {
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
