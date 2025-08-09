/**
 * @file chess-board-pipeline.ts
 *
 * Pipeline for checkered playable tiles in chess game.
 * 1. Set target height/color (color shows valid move/hover).
 */

import type { ChessHlTiles } from 'games/chess/chess-hl-tiles'
import type { Pipeline } from './pipeline'
import { baseChessBoardColors } from 'games/chess/chess-colors'
import type { TileColors } from 'gfx/styles/style'

interface CPL extends Pipeline {
  setHlTiles: (ChessHlTiles) => void
}

let hlTiles: ChessHlTiles

export const chessBoardPipeline = {

  setHlTiles: (hlt: ChessHlTiles) => {
    hlTiles = hlt
  },

  update: (_dt) => {
    if (hlTiles) hlTiles.update()
  },

  steps: [

    // 1. apply fixed height/color (color reflects valid move/hover)
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

      // color is checkered
      rTile.originalColors = baseChessBoardColors[checkeredIndex]
      if (!rTile.liveColors) {
        rTile.liveColors = deepCopy(rTile.originalColors)
      }

      return {
        // animated target color is checkered and reflects move/hover
        targetColors: hlTiles.colorOverrides[i],
        isWater: false,
        isFlora: false,
        height: 12 + 0.1 * checkeredIndex, // height is checkered
        isVisible: true,
        yOffset: 0,
      }
    },
  ],

} as const satisfies CPL

function deepCopy(colors: TileColors): TileColors {
  return {
    top: colors.top.clone(),
    sides: colors.sides.clone(),
  }
}
