/**
 * @file chess-update-helper.ts
 *
 * Handles animation loop update for each chess phase.
 */

import type { GameUpdateContext } from 'games/game'
import type { ChessPhase } from './chess-enums'
import type { Chess } from './chess-helper'
import { resetMeshes, setPiecePosition } from './chess-3d-gfx-helper'
import { playSound } from 'audio/sound-effects'
import { markLevelCompleted } from './levels/chess-level-parser'
import { Transition } from 'gfx/transitions/transition'
import { resetRewardsDisplay } from './gui/chess-reward-elements'
import type { ChessMoveAnim } from './chess-move-anim'
import { toggleGameOverMenu } from './gui/chess-dialog-elements'
import { emptyScene } from 'sea-block'
import { rewardChoiceBackground } from './chess-2d-gfx-helper'

export function updateChessPhase(context: ChessUpdateContext) {
  const func = PHASE_UPDATERS[context.chess.currentPhase]
  func(context)
}

interface ChessUpdateContext extends GameUpdateContext {
  chess: Chess
}

let ongoingMove: ChessMoveAnim | undefined = undefined

const PHASE_UPDATERS = {

  // phases with no passive chess-related animation
  'game-over': () => {},
  'place-pawn': () => {},
  'reached-chest': () => {},
  'reward-choice': () => {},
  'player-choice': () => {},

  // player executes one chosen move
  'player-anim': ({ chess, dt }) => {
    const { currentMove } = chess
    if (currentMove) {
      const isFinished = currentMove.update(dt)
      if (isFinished) {
        const { endTile } = currentMove

        // check if captured enemy
        const capturedPiece = chess.getPieceOnTile(endTile)
        if (capturedPiece) {
          const enemyIndex = chess.enemies.indexOf(capturedPiece)
          if (enemyIndex >= 0) {
            // enemy was captured
            playSound('chessGoodCapture')
            chess.enemies.splice(enemyIndex, 1) // delete captured enemy
            resetMeshes(chess, chess.player, [...chess.pawns], [...chess.enemies])
          }
        }

        // player may have been replaced in resetMeshes
        const { player } = chess

        // update logical tile
        player.tile = endTile

        chess.currentMove = undefined

        setPiecePosition(player, chess.getPosOnTile(player.tile))

        // check if landed on treasure chest
        if (player.tile.i === chess.goalTile.i) {
          completeLevel(chess)
          chess.currentPhase = 'reached-chest'
        }
        else {
          // playSound('chessPlonk')
          chess.hlTiles.updateAllowedMoves(chess)
          chess.gotoNextPhase()
        }
      }
      else {
        const pos = currentMove.getLivePosition()
        setPiecePosition(chess.player, pos)
      }
    }
    else {
      // somehow in player-anim phase but no currentMove
      chess.gotoNextPhase()
    }
  },

  // pawns move one-by-one automatically
  'pawn-anim': ({ chess, dt }) => {
    // find first non-null unfinished move
    const i = chess.pawnMoves.findIndex(move => move && !move.isFinished)
    if (i >= 0) {
      const piece = chess.pawns[i]
      const move = chess.pawnMoves[i] as ChessMoveAnim

      if (move !== ongoingMove) {
        // just started move
        ongoingMove = move
        playSound('chessJump')
      }

      const isFinished = move.update(dt)
      setPiecePosition(piece, move.getLivePosition())
      if (isFinished) {
        const { endTile } = move
        const capturedPiece = chess.getPieceOnTile(endTile)
        piece.tile = endTile // update logical tile

        // check if on treasure chest
        if (endTile.i === chess.goalTile.i) {
          completeLevel(chess)
        }

        // check if captured enemy
        if (capturedPiece) {
          const enemyIndex = chess.enemies.indexOf(capturedPiece)
          if (enemyIndex >= 0) {
            // enemy was captured
            playSound('chessGoodCapture')
            chess.enemies.splice(enemyIndex, 1) // delete captured enemy
            resetMeshes(chess, chess.player, [...chess.pawns], [...chess.enemies])
          }
        }
      }
    }
    else {
      // no pawn moves remaining
      chess.hlTiles.updateAllowedMoves(chess)
      chess.gotoNextPhase()
    }
  },

  // enemies move one-by-one automatically
  'enemy-anim': ({ chess, dt }) => {
    // find first non-null unfinished move
    const i = chess.enemyMoves.findIndex(move => move && !move.isFinished)
    if (i >= 0) {
      const piece = chess.enemies[i]
      const move = chess.enemyMoves[i] as ChessMoveAnim

      if (move.endTile === chess.player.tile) {
        dt /= 2 // slow down last move before game over
      }

      if (move !== ongoingMove) {
        // just started move
        ongoingMove = move
        playSound('chessJump')
      }

      const isFinished = move.update(dt)
      setPiecePosition(piece, move.getLivePosition())
      if (isFinished) {
        piece.tile = move.endTile // update logical tile

        const capturedPiece = chess.getPieceOnTile(move.endTile)
        if (capturedPiece) {
          const pawnIndex = chess.pawns.indexOf(capturedPiece)
          if (pawnIndex >= 0) {
            // pawn was captured
            playSound('chessBadCapture')
            chess.pawns.splice(pawnIndex, 1) // delete captured pawn
            resetMeshes(chess, chess.player, [...chess.pawns], [...chess.enemies])
          }
          else if (capturedPiece === chess.player) {
            // player was captured
            playSound('chessBadCapture')
            chess.currentPhase = 'game-over'
            toggleGameOverMenu(chess.context, true)
          }
        }
      }
    }
    else {
      // no enemy moves remaining
      chess.hlTiles.updateAllowedMoves(chess)
      chess.gotoNextPhase()
    }
  },
} as const satisfies Record<ChessPhase, (context: ChessUpdateContext) => void>

function completeLevel(chess: Chess) {
  markLevelCompleted() // prevent level from loading again
  playSound('chessCelebrate')

  chess.context.startTransition({
    transition: Transition.create('checkered', chess.context),
    callback: () => {
      chess.currentPhase = 'reward-choice'
      emptyScene.background = rewardChoiceBackground
      chess.context.game.gui.refreshLayout(chess.context)
      resetRewardsDisplay(chess)
    },
  })
}
