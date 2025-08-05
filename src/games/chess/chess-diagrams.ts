/**
 * @file chess-diagrams.ts
 *
 * Helpers to draw displays for chess help panel.
 */
import { goalDisplay, movesDisplay, flatViewportDisplay } from 'guis/imp/chess-gui'
import type { PieceName } from './chess-enums'
import { getImage } from 'gfx/2d/image-asset-loader'
import { pickColorsForChessTile } from './chess-colors'
import type { Chess } from './chess-helper'
import type { ChessTileHighlight } from './chess-hl-tiles'

export function buildGoalDiagram() {
  const buffer = goalDisplay?.imageset?.default
  if (!buffer) {
    throw new Error('chess goal diagram element has no buffer')
  }

  const { width, height } = buffer
  const ctx = buffer.getContext('2d') as OffscreenCanvasRenderingContext2D

  // Images
  const pieceName: PieceName = 'rook'
  const pieceImage = getImage(`icons/chess/16x16-${pieceName}.png`)
  const arrowImage = getImage('icons/16x16-arrow-right.png')
  const chestImage = getImage('icons/chess/16x16-chest.png')

  // Layout constants
  const ICON_SIZE = 16
  const ICON_DIST = 12 // adjustable distance between icons

  // Calculate positions
  const totalWidth = ICON_SIZE * 3 + ICON_DIST * 2
  const startX = (width - totalWidth) / 2
  const centerY = (height - ICON_SIZE) / 2

  // Draw piece (left)
  ctx.drawImage(pieceImage, startX, centerY, ICON_SIZE, ICON_SIZE)
  // Draw arrow (center)
  ctx.drawImage(arrowImage, startX + ICON_SIZE + ICON_DIST, centerY, ICON_SIZE, ICON_SIZE)
  // Draw chest (right)
  ctx.drawImage(chestImage, startX + 2 * (ICON_SIZE + ICON_DIST), centerY, ICON_SIZE, ICON_SIZE)
}

export function buildMovesDiagram() {
  const buffer = movesDisplay?.imageset?.default
  if (!buffer) {
    throw new Error('chess moves diagram element has no buffer')
  }
  const ctx = buffer.getContext('2d') as OffscreenCanvasRenderingContext2D

  // Board and piece constants
  const BOARD_SIZE = 5
  const TILE_SIZE = 10
  const PIECE_NAME: PieceName = 'rook'
  const pieceImage = getImage(`icons/chess/16x16-${PIECE_NAME}.png`)

  // Calculate board position (centered)
  const boardPx = BOARD_SIZE * TILE_SIZE
  const startX = (buffer.width - boardPx) / 2
  const startY = (buffer.height - boardPx) / 2

  // Draw 5x5 board
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const x = startX + col * TILE_SIZE
      const y = startY + row * TILE_SIZE
      const tileColors = pickColorsForChessTile({ x: col, z: row, i: 0 })
      ctx.fillStyle = tileColors.top.getStyle()
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
      ctx.strokeStyle = tileColors.sides.getStyle()
      ctx.lineWidth = 1
      ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1)
    }
  }

  // Draw the piece in the center tile
  const centerCol = BOARD_SIZE / 2
  const centerRow = BOARD_SIZE / 2
  const pieceX = startX + centerCol * TILE_SIZE
  const pieceY = startY + centerRow * TILE_SIZE
  ctx.drawImage(pieceImage,
    pieceX - pieceImage.width / 2,
    pieceY - pieceImage.height / 2,
  )
}

export function renderFlatView(
  chess: Chess,
) {
  const buffer = flatViewportDisplay?.imageset?.default
  if (!buffer) {
    throw new Error('flat viewport diagram element has no buffer')
  }

  flatViewportDisplay.needsUpdate = true
  const ctx = buffer.getContext('2d') as OffscreenCanvasRenderingContext2D

  const { currentPieceType, centerTile, goalTile, hlTiles, currentPieceMesh } = chess

  // Board constants
  const BOARD_SIZE = 5
  const TILE_SIZE = 16
  const pieceImage = getImage(`icons/chess/16x16-${currentPieceType}.png`)
  const goalImage = getImage('icons/chess/16x16-chest.png')

  // Center tile grid position
  const centerCol = Math.floor(BOARD_SIZE / 2)
  const centerRow = Math.floor(BOARD_SIZE / 2)

  // Calculate board position (centered)
  const boardPx = BOARD_SIZE * TILE_SIZE
  const startX = (buffer.width - boardPx) / 2
  const startY = (buffer.height - boardPx) / 2

  const cx = (buffer.width - TILE_SIZE) / 2
  const cy = (buffer.height - TILE_SIZE) / 2

  // Draw 5x5 board
  for (let row = -2; row <= 2; row++) {
    for (let col = -2; col <= 2; col++) {
      const tileIndex = chess.context.terrain.grid.xzToIndex(centerTile.x + col, centerTile.z + row)

      // pick highlight mode
      let hl: ChessTileHighlight | undefined = undefined
      if (tileIndex && hlTiles.allowedMoves.has(tileIndex.i)) {
        hl = 'allowedMove'
      }
      if (tileIndex === chess.lastHoveredTile) {
        hl = 'hover'
      }
      const tileColors = pickColorsForChessTile({ x: row, z: col, i: 0 }, hl)
      ctx.fillStyle = tileColors.top.getStyle()

      const x = cx + col * TILE_SIZE
      const y = cy + row * TILE_SIZE
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
      ctx.strokeStyle = tileColors.sides.getStyle()
      ctx.lineWidth = 1
      ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1)
    }
  }

  // draw player
  const player = chess.getPiecePosition(currentPieceMesh).clone()
  const centerPos = chess.getPosOnTile(centerTile)
  const rookCol = centerCol + (player.x - centerPos.x)
  const rookRow = centerRow + (player.z - centerPos.z)
  const rookX = startX + rookCol * TILE_SIZE
  const rookY = startY + rookRow * TILE_SIZE
  ctx.drawImage(pieceImage, rookX, rookY, TILE_SIZE, TILE_SIZE)

  // draw goal
  const goal = goalTile
  const goalCol = centerCol + (goal.x - centerTile.x)
  const goalRow = centerRow + (goal.z - centerTile.z)
  const goalX = startX + goalCol * TILE_SIZE
  const goalY = startY + goalRow * TILE_SIZE
  ctx.drawImage(goalImage, goalX, goalY, TILE_SIZE, TILE_SIZE)
}
