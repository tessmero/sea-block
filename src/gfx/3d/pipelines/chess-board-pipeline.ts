/**
 * @file chess-board-pipeline.ts
 *
 * Pipeline for checkered tiles in chess game.
 * 0. ...freecam pipeline
 * 1. If part of board, replace height and colors.
 * 2. If valid move, replace colors.
 * 3. If hovered, replace colors.
 * 4. If pressed, replace colors and decrease height.
 */

import type { Pipeline } from './pipeline'
import { baseChessBoardColors, pickColorsForChessTile } from 'games/chess/gfx/chess-colors'
import { restoreTileColors, setOriginalTileColors } from '../tile-group-color-buffer'
import { isTileHeld } from 'games/chess/chess-input-helper'
import { freeCamPipeline } from './free-cam-pipeline'
import { Chess } from 'games/chess/chess-helper'

// pipeline with chess-specific method
interface CPL extends Pipeline {
  setChess: (Chess) => void
}

let chess: Chess

export const chessBoardPipeline = {

  setChess: (ch: Chess) => {
    chess = ch
  },

  update: (_dt) => {
    // if (hlTiles) hlTiles.update()
  },

  steps: [

    // 0. inherit freecam pipeline
    ...freeCamPipeline.steps,

    // 1. Set base checkered height and color.
    ({ group, tileIndex, current }) => {
      const { x, z, i } = tileIndex

      if (!chess.boardTiles.includes(i)) {
        // tile is not on board
        restoreTileColors(tileIndex) // may have been previously highlighted
        return current
      }
      const checkeredIndex = Math.abs((x + z) % 2)

      let rTile = group.generatedTiles[i]
      if (!rTile) {
        Chess.queueHltUpdate()

        // tile not yet generated
        rTile = {
          gTile: {
            color: baseChessBoardColors[checkeredIndex].top,
            isWater: false,
            isFlora: false,
            height: 10 + checkeredIndex,
          },
        }
        group.generatedTiles[i] = rTile
      }

      setOriginalTileColors(tileIndex, baseChessBoardColors[checkeredIndex])

      return {
        targetColors: baseChessBoardColors[checkeredIndex],
        isWater: false,
        isFlora: false,
        height: 12 + 0.1 * checkeredIndex, // height is checkered
        isVisible: true,
        yOffset: 0,
      }
    },

    // 2. If valid move, replace colors.
    ({ current, tileIndex }) => {
      const { allowedMoves } = chess.hlTiles
      const { i } = tileIndex

      if (allowedMoves.has(i)) {
        if (current.isWater) {
          // console.log('water tile in allowed moves')
          Chess.queueHltUpdate()
        }
        else {
          current.targetColors = pickColorsForChessTile(tileIndex, 'allowedMove')
        }
      }
      return current
    },
    // 3. If hovered, replace colors.
    ({ current, tileIndex }) => {
      const { hovered } = chess.hlTiles
      if (hovered && hovered.i === tileIndex.i) {
        current.targetColors = pickColorsForChessTile(tileIndex, 'hover')

        // console.log('cbp hover tile', chess.context.terrain.grid.indexToPosition(tileIndex))
      }
      return current
    },
    // 4. If pressed, replace colors and decrease height.
    ({ current, tileIndex }) => {
      if (isTileHeld(tileIndex)) {
        current.targetColors = pickColorsForChessTile(tileIndex, 'hold')
        current.height -= 0.1
        return current
      }
      return current
    },
  ],

} as const satisfies CPL
