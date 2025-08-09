/**
 * @file chess-game.ts
 *
 * Game implementation that points to modules in src/games/chess.
 */
import { Game } from 'games/game'
import { chessAllow3DRender, getChessPipeline, resetChess, updateChess } from 'games/chess/chess-helper'
import { treasureChestElement, chessPieceElements } from 'games/chess/chess-meshes'
import { freeCamPipeline } from 'gfx/3d/tile-render-pipeline/free-cam-pipeline'
import type { Pipeline } from 'gfx/3d/tile-render-pipeline/pipeline'
import type { TileIndex } from 'core/grid-logic/indexed-grid'

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


  reset = resetChess
  getTerrainRenderPipeline = getChessPipeline
  update = updateChess
  doesAllow3DRender = chessAllow3DRender
}
