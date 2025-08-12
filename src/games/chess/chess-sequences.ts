/**
 * @file chess-sequences.ts
 *
 * Helps with sequencing of phases in chess game
 * and moves within phases.
 */

import type { ChessPhase } from './chess-enums'
import type { Chess } from './chess-helper'
import type { RenderablePiece } from './chess-3d-gfx-helper'
import { ChessMoveAnim } from './chess-move-anim'
import { canLandOn, getAllowedMoves } from './chess-rules'

export const nextPhasePickers: Record<ChessPhase, (chess: Chess) => ChessPhase> = {

  'player-anim': ({ pawns, enemies }) => {
    if (pawns.length > 0) {
      return 'pawn-anim'
    }
    if (enemies.length > 0) {
      return 'enemy-anim'
    }
    return 'player-choice'
  },

  'pawn-anim': ({ enemies }) => {
    if (enemies.length > 0) {
      return 'enemy-anim'
    }
    return 'player-choice'
  },
  'enemy-anim': () => 'player-choice',
  'player-choice': () => 'player-anim',
  'place-pawn': () => 'player-choice',
  'reward-choice': () => 'player-choice',
  'game-over': () => 'game-over',
}

// prep moves for enemy-anim phase
export function buildEnemyMoves(chess: Chess): Array<ChessMoveAnim | null> {
  const reserved: Set<number> = new Set()
  return chess.enemies.map(p => pickEnemyMove(p, chess, reserved))
}
function pickEnemyMove(enemy: RenderablePiece, chess: Chess, reserved: Set<number>): ChessMoveAnim | null {
  const { boardTiles } = chess
  const { terrain } = chess.context

  // get all allowed moves for this enemy
  const allowedMoves = getAllowedMoves({ type: enemy.type, tile: enemy.tile, terrain, chess })

  for (const targetTile of allowedMoves) {
    if (reserved.has(targetTile.i)) {
      continue
    }
    const target = chess.getPieceOnTile(targetTile)
    if (target && !target.isEnemy) {
      // enemy will attack friendly piece
      reserved.add(targetTile.i)
      return new ChessMoveAnim(
        chess.getPosOnTile(enemy.tile).clone(),
        chess.getPosOnTile(targetTile).clone(),
        targetTile,
      )
    }
  }

  return null // enemy will not move
}

// prep moves for pawn-anim phase
export function buildPawnMoves(chess: Chess): Array<ChessMoveAnim | null> {
  return chess.pawns.map(p => pickPawnMove(p, chess))
}
function pickPawnMove(pawn: RenderablePiece, chess: Chess): ChessMoveAnim | null {
  const { terrain } = chess.context
  const { boardTiles } = chess
  const { grid } = terrain
  const { x, z } = pawn.tile

  // check attacks in random order
  const attackTiles = [[x - 1, z - 1], [x + 1, z - 1]]
  if (Math.random() < 0.5) {
    attackTiles.reverse()
  }
  for (const [ax, az] of attackTiles) {
    const attackTile = grid.xzToIndex(ax, az)
    if (!attackTile) continue
    const target = chess.getPieceOnTile(attackTile)
    if (target && target.isEnemy) {
    // pawn will attack
      return new ChessMoveAnim(
        chess.getPosOnTile(pawn.tile).clone(),
        chess.getPosOnTile(attackTile).clone(),
        attackTile,
      )
    }
  }

  // check forward move
  const forwardTile = grid.xzToIndex(x, z - 1)
  if (forwardTile
    && canLandOn(forwardTile, { type: pawn.type, tile: pawn.tile, terrain, chess })
    && !chess.getPieceOnTile(forwardTile) // tile must not be occupied
  ) {
    // pawn will move forward
    return new ChessMoveAnim(
      chess.getPosOnTile(pawn.tile).clone(),
      chess.getPosOnTile(forwardTile).clone(),
      forwardTile,
    )
  }

  return null // pawn will not move
}
