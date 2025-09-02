/**
 * @file chess-2d-gfx-helper.ts
 *
 * Helpers to draw chess help panel and 2d view mode.
 */
import { PIECE_NAMES, type PieceName } from '../chess-enums'
import { getImage } from 'gfx/2d/image-asset-loader'
import type { Chess } from '../chess-helper'
import { COLLECTIBLES } from '../chess-rewards'
import type { StaticElement } from 'guis/gui'
import type { CollectibleName } from '../levels/chess-levels.json.d'
import { flatViewportDisplay, goalDisplays, pawnLabel } from '../gui/chess-hud-elements'
import { getPiecePosition } from './chess-3d-gfx-helper'
import { getLiveTileColors } from 'gfx/3d/tile-group-color-buffer'
import { drawText } from 'gfx/2d/text/text-gfx-helper'
import { isTileHeld } from '../chess-input-helper'
import { addToSpriteAtlas } from 'gfx/2d/sprite-atlas'
import { chessRun } from '../chess-run'
import { Color, Vector3 } from 'three'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { Tiling } from 'core/grid-logic/tilings/tiling'

export const rewardChoiceBackground = new Color(0x000000)
export const flatChessBackground = new Color(0xaaccff) // sky color

export function updatePawnButtonLabel() {
  const elem = pawnLabel
  const buffer = elem.display.imageset?.default
  if (!buffer) {
    throw new Error(`chess pawn button label with layout key ${elem.layoutKey} has no buffer`)
  }
  const { width, height } = buffer

  const ctx = buffer.getContext('2d') as OffscreenCanvasRenderingContext2D

  ctx.clearRect(0, 0, width, height)

  drawText(ctx, {
    width, height,
    label: `${chessRun.collectedPawns}`,
    offset: [-10, 0],
  })

  // draw pawn icon centered
  const iconImage = getImage('icons/chess/8x8-pawn.png')
  const ICON_SIZE = iconImage.width
  const x = (buffer.width - ICON_SIZE) / 2
  const y = (buffer.height - ICON_SIZE) / 2
  ctx.drawImage(iconImage, x + 10, y, ICON_SIZE, ICON_SIZE)
}

export function buildRewardChoiceDiagram(elem: StaticElement, reward: CollectibleName) {
  const buffer = elem.display.imageset?.default
  if (!buffer) {
    throw new Error(`chess reward diagram element with layout key ${elem.layoutKey} has no buffer`)
  }

  // draw reward icon centered
  const { icon } = COLLECTIBLES[reward]
  const iconImage = getImage(icon)
  const ctx = buffer.getContext('2d') as OffscreenCanvasRenderingContext2D
  ctx.clearRect(0, 0, buffer.width, buffer.height)
  const ICON_SIZE = iconImage.width
  const x = (buffer.width - ICON_SIZE) / 2
  const y = (buffer.height - ICON_SIZE) / 2
  ctx.drawImage(iconImage, x, y, ICON_SIZE, ICON_SIZE)
}

export function buildGoalDiagram(piece: PieceName) {
  // console.log('build goal diagram', piece)
  let frameIndex = 0
  for (const goalDisplay of goalDisplays) {
    const buffer = goalDisplay?.imageset?.default
    if (!buffer) {
      throw new Error('chess goal diagram element has no buffer')
    }
    buildGoalFrame(buffer, piece, frameIndex - 1)
    goalDisplay.needsUpdate = true
    frameIndex++
  }
}

function buildGoalFrame(buffer: OffscreenCanvas, piece: PieceName, arrowOffset = 0) {
  const { width, height } = buffer
  const ctx = buffer.getContext('2d') as OffscreenCanvasRenderingContext2D
  ctx.clearRect(0, 0, buffer.width, buffer.height)

  // Images
  const pieceImage = getImage(`icons/chess/16x16-${piece}.png`)
  const arrowImage = getImage('icons/16x16-arrow-right.png')
  const chestImage = getImage('icons/chess/16x16-chest.png')

  // Layout constants
  const ICON_SIZE = 16
  const ICON_DIST = -6 // adjustable distance between icons

  // Calculate positions
  const totalWidth = ICON_SIZE * 3 + ICON_DIST * 2
  const startX = (width - totalWidth) / 2
  const centerY = (height - ICON_SIZE) / 2

  // Draw piece (left)
  ctx.drawImage(pieceImage, startX, centerY, ICON_SIZE, ICON_SIZE)
  // Draw arrow (center)
  ctx.drawImage(arrowImage, startX + arrowOffset + ICON_SIZE + ICON_DIST, centerY, ICON_SIZE, ICON_SIZE)
  // Draw chest (right)
  ctx.drawImage(chestImage, startX + 2 * (ICON_SIZE + ICON_DIST), centerY, ICON_SIZE, ICON_SIZE)
}

// Board constants
const BOARD_SIZE = 5
const TILE_SIZE = 16

export function updateFlatView(
  chess: Chess,
) {
  const buffer = flatViewportDisplay?.imageset?.default
  if (!buffer) {
    throw new Error('flat viewport diagram element has no buffer')
  }

  flatViewportDisplay.isVisible = true
  flatViewportDisplay.needsUpdate = true

  drawFlatView(buffer, chess)
}

export function drawFlatView(
  buffer: OffscreenCanvas,
  chess: Chess,
) {
  const ctx = buffer.getContext('2d') as OffscreenCanvasRenderingContext2D
  const { centerTile, goalTile, player, pawns, enemies } = chess

  ctx.clearRect(0, 0, buffer.width, buffer.height)

  // Center tile grid position
  const centerCol = Math.floor(BOARD_SIZE / 2)
  const centerRow = Math.floor(BOARD_SIZE / 2)

  // Calculate board position (centered)
  const boardPx = BOARD_SIZE * TILE_SIZE
  const startX = (buffer.width - boardPx) / 2
  const startY = (buffer.height - boardPx) / 2

  const centerPos = chess.getPosOnTile(centerTile, new Vector3())
  // const cx = (buffer.width - TILE_SIZE) / 2
  // const cy = (buffer.height - TILE_SIZE) / 2

  // Draw 5x5 board
  for (let row = -2; row <= 2; row++) {
    for (let col = -2; col <= 2; col++) {
      const tileIndex = chess.context.terrain.grid.xzToIndex(centerTile.x + col, centerTile.z + row)
      if (!tileIndex) {
        continue
      }

      const tilePos = chess.getPosOnTile(tileIndex)
      const x = startX + (centerCol + (tilePos.x - centerPos.x)) * TILE_SIZE
      const y = startY + (centerRow + (tilePos.z - centerPos.z)) * TILE_SIZE

      // draw tile
      drawTile(ctx, x, y, chess.context.terrain.grid.tiling, tileIndex)

      if (isTileHeld(tileIndex)) {
        // draw again on pixel lower
        drawTile(ctx, x, y + 1, chess.context.terrain.grid.tiling, tileIndex)
      }
    }
  }

  // draw player
  const playerPos = getPiecePosition(player)// .clone()
  const playerX = startX + (centerCol + (playerPos.x - centerPos.x)) * TILE_SIZE
  const playerY = startY + (centerRow + (playerPos.z - centerPos.z)) * TILE_SIZE
  const playerImg = getImage(`icons/chess/16x16-${player.type}.png`)
  ctx.drawImage(playerImg, playerX, playerY, TILE_SIZE, TILE_SIZE)

  // draw pawns
  const pawnImg = getImage('icons/chess/16x16-pawn.png')
  for (const pawn of pawns) {
    const pawnPos = getPiecePosition(pawn)// .clone()
    const pawnX = startX + (centerCol + (pawnPos.x - centerPos.x)) * TILE_SIZE
    const pawnY = startY + (centerRow + (pawnPos.z - centerPos.z)) * TILE_SIZE
    ctx.drawImage(pawnImg, pawnX, pawnY, TILE_SIZE, TILE_SIZE)
  }

  // draw enemies
  for (const enemy of enemies) {
    const enemyPos = getPiecePosition(enemy)// .clone()
    const enemyX = startX + (centerCol + (enemyPos.x - centerPos.x)) * TILE_SIZE
    const enemyY = startY + (centerRow + (enemyPos.z - centerPos.z)) * TILE_SIZE
    const enemyImg = enemyImages[enemy.type]
    if (enemyImg) {
      ctx.drawImage(enemyImg, enemyX, enemyY, TILE_SIZE, TILE_SIZE)
    }
  }

  // draw goal
  // const goal = goalTile
  // const goalCol = centerCol + (goal.x - centerTile.x)
  // const goalRow = centerRow + (goal.z - centerTile.z)
  // const goalX = startX + goalCol * TILE_SIZE
  // const goalY = startY + goalRow * TILE_SIZE
  const goalPos = chess.context.terrain.grid.indexToPosition(goalTile)
  const goalX = startX + (centerCol + (goalPos.x - centerPos.x)) * TILE_SIZE
  const goalY = startY + (centerRow + (goalPos.z - centerPos.z)) * TILE_SIZE
  const goalImage = getImage('icons/chess/16x16-chest.png')
  ctx.drawImage(goalImage, goalX, goalY, TILE_SIZE, TILE_SIZE)
}

function drawTile(ctx, x: number, y: number, tiling: Tiling, tileIndex: TileIndex) {
  const tileColors = getLiveTileColors(tileIndex)
  ctx.fillStyle = tileColors.top.getStyle()
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
  ctx.strokeStyle = tileColors.sides.getStyle()
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1)
}

// red copies of piece images
const enemyImages: Partial<Record<PieceName, CanvasImageSource>> = {}
const enemyRgba = [200, 0, 0, 255]

// called in startup
export async function preloadChessSprites(): Promise<void> {
  const promises: Array<Promise<void>> = []
  for (const piece of PIECE_NAMES) {
    const blackImg = getImage(`icons/chess/16x16-${piece}.png`)
    const w = blackImg.width
    const h = blackImg.height

    promises.push(new Promise<void>((resolve, reject) => {
      // Create a new canvas 4x taller
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(blackImg, 0, 0)
      const imageData = ctx.getImageData(0, 0, w, h)
      const data = imageData.data
      for (let p = 0; p < data.length; p += 4) {
        if (data[p + 3] > 0) {
          const [r, g, b, a] = enemyRgba
          data[p] = r
          data[p + 1] = g
          data[p + 2] = b
          data[p + 3] = a
        }
      }
      ctx.putImageData(imageData, 0, 0)
      const outImg = new window.Image()
      outImg.onload = () => {
        enemyImages[piece] = outImg
        addToSpriteAtlas(outImg)
        resolve()
      }
      outImg.onerror = reject
      outImg.src = canvas.toDataURL()
    }))
  }
}
