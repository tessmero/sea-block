/**
 * @file chess-game.ts
 *
 * Game implementation that points to modules in src/games/chess.
 */
import { Game } from 'games/game'
import type { Chess } from 'games/chess/chess-helper'
import { chessAllow3DRender, resetChess, updateChess } from 'games/chess/chess-helper'
import { treasureChestElement, chessPieceElements, getChessPipeline, getChessCamOffset } from 'games/chess/chess-3d-gfx-helper'

export class ChessGame extends Game {
  static {
    Game.register('chess', {
      factory: () => new ChessGame(),
      guiName: 'chess',
      elements: [
        ...chessPieceElements,
        treasureChestElement,
      ],
    })
  }

  chess!: Chess

  // private static hasMadeChessPiecesPickable = false
  reset = (context) => {
    this.chess = resetChess(context)

    // if (!ChessGame.hasMadeChessPiecesPickable) {
    //   ChessGame.hasMadeChessPiecesPickable = true
    //   this.pickableMeshes.push(...Object.values(chessPieceMeshes))
    //   for( const pieceName of PIECE_NAMES ){
    //     (chessPieceMeshes[pieceName] as any).gameElement = chessPieceElements[pieceName]
    //   }
    // }
  }

  getTerrainRenderPipeline = tile => getChessPipeline(this.chess, tile)
  update = updateChess
  doesAllow3DRender = chessAllow3DRender
  getCamOffset = getChessCamOffset
}
