/**
 * @file chess-game.ts
 *
 * Game implementation that points to modules in src/games/chess.
 */
import { Game } from 'games/game'
import type { Chess } from 'games/chess/chess-helper'
import { chessAllow3DRender, resetChess, updateChess } from 'games/chess/chess-helper'
import {
  treasureChestElement, instancedPieceElements, getChessPipeline, getChessCamOffset,
  outlinedPieceElements,
  resetChessCamera,
} from 'games/chess/gfx/chess-3d-gfx-helper'

export class ChessGame extends Game {
  static {
    Game.register('chess', {
      factory: () => new ChessGame(),
      guiName: 'chess',
      elements: [
        ...instancedPieceElements,
        ...outlinedPieceElements,
        treasureChestElement,
      ],
    })
  }

  chess!: Chess

  // private static hasMadeChessPiecesPickable = false
  reset = (context) => {
  // snap to good camera position in case initial seamless-transition was skipped
    if (context.config.flatConfig.transitionMode === 'skip') {
      this.resetCamera(context)
    }

    // if (this.chess?.currentPhase === 'reward-choice') {
    //   return
    // }
    this.chess = resetChess(context)

    // if (!ChessGame.hasMadeChessPiecesPickable) {
    //   ChessGame.hasMadeChessPiecesPickable = true
    //   this.pickableMeshes.push(...Object.values(chessPieceMeshes))
    //   for( const pieceName of PIECE_NAMES ){
    //     (chessPieceMeshes[pieceName] as any).gameElement = chessPieceElements[pieceName]
    //   }
    // }
  }

  resetCamera = resetChessCamera

  getTerrainRenderPipeline = tile => getChessPipeline(this.chess, tile)
  update = updateChess
  doesAllow3DRender = chessAllow3DRender
  getCamOffset = getChessCamOffset
}
