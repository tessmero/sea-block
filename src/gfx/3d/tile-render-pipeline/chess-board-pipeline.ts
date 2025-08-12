/**
 * @file chess-board-pipeline.ts
 *
 * Pipeline for checkered tiles in chess game.
 * 1. Set base checkered height and color.
 * 2. If valid move, replace colors.
 * 3. If hovered, replace colors.
 * 4. If pressed, replace colors and decrease height.
 */

import type { ChessHlTiles } from 'games/chess/chess-hl-tiles'
import type { Pipeline } from './pipeline'
import { baseChessBoardColors, pickColorsForChessTile } from 'games/chess/chess-colors'
import { setOriginalTileColors } from '../tile-group-color-buffer'
import { isTileHeld } from 'games/chess/chess-input-helper'

// pipeline with chess-specific method
interface CPL extends Pipeline {
  setHlTiles: (ChessHlTiles) => void
}

let hlTiles: ChessHlTiles

export const chessBoardPipeline = {

  setHlTiles: (hlt: ChessHlTiles) => {
    hlTiles = hlt
  },

  update: (_dt) => {
    // if (hlTiles) hlTiles.update()
  },

  steps: [

    // 1. Set base checkered height and color.
    ({ group, tileIndex }) => {
      const { x, z, i } = tileIndex
      const checkeredIndex = Math.abs((x + z) % 2)

      let rTile = group.generatedTiles[i]
      if (!rTile) {
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
      const { allowedMoves } = hlTiles
      const { i } = tileIndex
      if (allowedMoves.has(i)) {
        current.targetColors = pickColorsForChessTile(tileIndex, 'allowedMove')
      }
      return current
    },
    // 3. If hovered, replace colors.
    ({ current, tileIndex }) => {
      const { hovered } = hlTiles
      if (hovered && hovered.i === tileIndex.i) {
        current.targetColors = pickColorsForChessTile(tileIndex, 'hover')
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
