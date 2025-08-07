/**
 * @file chess-sequences.ts
 *
 * Helps with sequencing of phases in chess game
 * and moves within phases.
 */

import type { ChessPhase } from './chess-enums'
import type { Chess, RenderablePiece } from './chess-helper'
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
}

export function buildPawnMoves(chess: Chess): Array<ChessMoveAnim | null> {
  const result: Array<ChessMoveAnim | null> = []
  const { terrain } = chess.context
  const { grid } = terrain

  return chess.pawns.map(p => pickPawnMove(p, chess))
}

export function buildEnemyMoves(chess: Chess): Array<ChessMoveAnim | null> {
  const result: Array<ChessMoveAnim | null> = []
  const { terrain } = chess.context
  const { grid } = terrain

  return chess.enemies.map(p => pickEnemyMove(p, chess))
}

function pickEnemyMove(enemy: RenderablePiece, chess: Chess): ChessMoveAnim | null {
  const { terrain } = chess.context
  const { grid } = terrain

  // get all allowed moves for this enemy
  const allowedMoves = getAllowedMoves({ piece: enemy, terrain })

  for (const targetTile of allowedMoves) {
    const target = chess.getPieceOnTile(targetTile)
    if (target && !target.isEnemy) {
      // enemy will attack friendly piece
      return new ChessMoveAnim(
        chess.getPosOnTile(enemy.tile).clone(),
        chess.getPosOnTile(targetTile).clone(),
        targetTile,
      )
    }
  }

  return null // enemy will not move
}

function pickPawnMove(pawn: RenderablePiece, chess: Chess): ChessMoveAnim | null {
  const { terrain } = chess.context
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
    && canLandOn(forwardTile, { piece: pawn, terrain })
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
