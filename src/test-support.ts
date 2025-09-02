/**
 * @file test-support.ts
 *
 * Interface to support automated report ath appears on tessmero.github.io.
 */

import { getPickablePieceMeshPosition } from 'games/free-cam/freecam-pickable-meshes'
import type { ChessGame } from 'games/imp/chess-game'
import type { SeaBlock } from 'sea-block'
import { locateOnScreen, tsLocateOnScreen } from 'util/locate-on-screen'

export function getTestSupport(seaBlock: SeaBlock) {
  return {

    getSetting: (key) => {
      return seaBlock.config.flatConfig[key]
    },

    applySetting: (key, value) => {
      seaBlock.config.tree.children[key].value = value // only works for items at top level
      seaBlock.config.flatConfig[key] = value
    },

    getGameState: () => {
      if (!seaBlock.didLoadAssets) {
        return 'loading'
      }
      if (seaBlock.transition) {
        return 'transition'
      }
      return seaBlock.currentGameName
    },

    getCameraPos: () => {
      const { x, y, z } = seaBlock.camera.position
      return [x, y, z]
    },

    getCursorState: () => {
      if (!('mousePosForTestSupport' in seaBlock)) {
        return null
      }
      return {
        x: (seaBlock as any).mousePosForTestSupport.x, // eslint-disable-line @typescript-eslint/no-explicit-any
        y: (seaBlock as any).mousePosForTestSupport.y, // eslint-disable-line @typescript-eslint/no-explicit-any
        style: document.documentElement.style.cursor,
      }
    },

    locateElement(id: string) {
      // // tile on chess board
      if (id.startsWith('chessBoard')) {
        const chess = (seaBlock.game as ChessGame).chess

        // 'chessBoard(0-0)' = center tile
        const match = id.match(/chessBoard\(([-\d]+),([-\d]+)\)/)
        if (!match) return
        const dx = parseInt(match[1])
        const dz = parseInt(match[2])
        const tileIndex = chess.context.terrain.grid.xzToIndex(
          chess.centerTile.x + dx, // increase x -> right
          chess.centerTile.z - dz, // increase z -> forward
        )
        if (!tileIndex) {
          return
        }
        return tsLocateOnScreen(seaBlock, chess.getPosOnTile(tileIndex))
      }

      // pickable mesh in freecam
      if (id === 'rookMesh') {
        const result = getPickablePieceMeshPosition('rook')
        if (result) {
          return tsLocateOnScreen(seaBlock, result)
        }
      }

      // treat id as layout key
      const rect = seaBlock.game.gui.layoutRectangles[id]
      if (!rect) return
      const { x, y, w, h } = rect
      const ps = seaBlock.config.flatConfig.pixelScale
      return [x * ps, y * ps, w * ps, h * ps]

      // const elem = global.gui.findElements({ titleKey }).next().value;
      // const screenRect = elem._rect;
      // return this._computeCanvasRect(screenRect);
    },
  }
}
