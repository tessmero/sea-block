/**
 * @file chess-help-diagrams.ts
 *
 * Draw miniature chess boards to show rules for pieces.
 */

import { getImage } from 'gfx/2d/image-asset-loader'
import type { PieceName } from '../chess-enums'
import { CHESS_MOVES } from '../chess-rules'
import type { ChessTileHighlight } from '../chess-hl-tiles'
import { pickColorsForChessTile } from './chess-colors'
import type { Rectangle } from 'util/layout-parser'

type Params = {
  piece: PieceName
  rectangle: Rectangle
}

export function drawMovesDiagram(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  params: Params,
) {
  // ctx.clearRect(0, 0, width, height)
  const { piece, rectangle } = params

  // Board and piece constants
  const BOARD_SIZE = 5
  const TILE_SIZE = 10
  const pieceImage = getImage(`icons/chess/8x8-${piece}.png`)

  // check allowed moves for piece
  const hash = (x, y) => 100 * x + y
  const allowedHashes: Array<number> = []
  const { range, deltas } = CHESS_MOVES[piece]
  for (const [x, y] of deltas) {
    allowedHashes.push(hash(x, y))
    if (range === 'long') {
      allowedHashes.push(hash(2 * x, 2 * y))
    }
  }

  // Calculate board position (centered in rectangle)
  const boardPx = BOARD_SIZE * TILE_SIZE
  const startX = rectangle.x + (rectangle.w - boardPx) / 2
  const startY = rectangle.y + (rectangle.h - boardPx) / 2

  // Draw 5x5 board
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const x = startX + col * TILE_SIZE
      const y = startY + row * TILE_SIZE
      let hl: ChessTileHighlight | undefined = undefined
      if (allowedHashes.includes(hash(col - 2, row - 2))) {
        hl = 'allowedMove'
      }
      const tileColors = pickColorsForChessTile({ x: col, z: row, i: 0 }, hl)
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
  ctx.drawImage(
    pieceImage,
    pieceX - pieceImage.width / 2,
    pieceY - pieceImage.height / 2,
  )
}
