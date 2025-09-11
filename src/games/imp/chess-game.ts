/**
 * @file chess-game.ts
 *
 * Game implementation that points to modules in src/games/chess.
 */
import { Game } from 'games/game'
import { chessAllow3DRender, chessAllowGgui,
  chessAllowGgui3DCursor, resetChess, updateChess } from 'games/chess/chess'
import {
  treasureChestElement, instancedPieceElements, getChessCamOffset,
  outlinedPieceElements,
  resetChessCamera,
} from 'games/chess/gfx/chess-3d-gfx-helper'
import { chessBoardPipeline } from 'gfx/3d/pipelines/chess-board-pipeline'

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

  // private static hasMadeChessPiecesPickable = false
  reset = (context) => {
  // snap to good camera position in case initial seamless-transition was skipped
    if (context.config.flatConfig.transitionMode === 'skip') {
      this.resetCamera(context)
    }

    // if (this.chess?.currentPhase === 'reward-choice') {
    //   return
    // }

    resetChess(context)

    // if (!ChessGame.hasMadeChessPiecesPickable) {
    //   ChessGame.hasMadeChessPiecesPickable = true
    //   this.pickableMeshes.push(...Object.values(chessPieceMeshes))
    //   for( const pieceName of PIECE_NAMES ){
    //     (chessPieceMeshes[pieceName] as any).gameElement = chessPieceElements[pieceName]
    //   }
    // }
  }

  resetCamera = resetChessCamera

  getTerrainRenderPipeline = () => chessBoardPipeline
  update = updateChess
  doesAllowGgui = chessAllowGgui
  doesAllowGgui3DCursor = chessAllowGgui3DCursor
  doesAllow3DRender = chessAllow3DRender
  getCamOffset = getChessCamOffset
}
