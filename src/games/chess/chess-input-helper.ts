/**
 * @file chess-input-helper.ts
 *
 * Handlers for mouse/touch inputs on chessboard flat view / terrain tiles.
 */

import { isTouchDevice, type ProcessedSubEvent } from 'mouse-touch-input'
import { chessRun } from './chess-run'
import type { Chess } from './chess-helper'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { chessPieceMeshes, setPiecePosition } from './chess-3d-gfx-helper'
import type { InputId } from 'input-id'
import { playSound } from 'audio/sound-effects'
import { updatePawnButtonLabel } from './chess-2d-gfx-helper'

// click action for flat viewport gui element
export function flatViewPortClick(chess: Chess, inputEvent: ProcessedSubEvent) {
  if ('lvPos' in inputEvent && chessRun.collected.includes('dual-vector-foil')) {
    const tile = pickTileInFlatView(chess, inputEvent)
    if (tile) {
      clickTile(chess, tile, inputEvent)
    }
  }
}
export function flatViewPortUnclick(chess: Chess, inputEvent: ProcessedSubEvent) {
  if ('lvPos' in inputEvent && chessRun.collected.includes('dual-vector-foil')) {
    const tile = pickTileInFlatView(chess, inputEvent)
    if (tile) {
      unclickTile(chess, tile, inputEvent)
    }
  }
}

export function pickTileInFlatView(chess: Chess, inputEvent: ProcessedSubEvent): TileIndex | undefined {
  const { lvPos } = inputEvent
  const { gui } = inputEvent.seaBlock.game

  // check if hovering flat view
  if (lvPos) {
    const layoutKey = 'flatViewport'
    const rectangle = gui.overrideLayoutRectangles[layoutKey] || gui.layoutRectangles[layoutKey]
    if (rectangle) {
      // compute point in units of flat view tiles
      const { x, y } = rectangle
      const col = (lvPos.x - x) / 16
      const row = (lvPos.y - y) / 16
      if (col > 0 && col < 5 && row > 0 && row < 5) {
        // point is inside flat view
        const tile = chess.context.terrain.grid.xzToIndex(
          Math.floor(chess.centerTile.x + col - 2),
          Math.floor(chess.centerTile.z + row - 2),
        )
        return tile
      }
    }
  }
}

export function updateHeldChessInputs() {
  const t = performance.now()
  for (const inputId in chessInputHolds) {
    const hold = chessInputHolds[inputId] as ChessInputHold
    const delta = t - hold?.time
    if (delta > holdExpireTime) {
      playSound('chessCancel')
      delete chessInputHolds[inputId]
    }
  }
}

// hover 3d terrain chessboard
export function hoverChessWorld(chess: Chess, inputEvent: ProcessedSubEvent) {
  // if (inputEvent.seaBlock.config.flatConfig.chessViewMode === '2D') {
  if (chessRun.collected.includes('dual-vector-foil')) {
    // hover 2d tile
    const flatTile = pickTileInFlatView(chess, inputEvent)
    hoverTile(chess, flatTile, inputEvent)
  }
  else if (chess.currentPhase !== 'reward-choice') {
    // hover 3d tile
    hoverTile(chess, inputEvent.pickedTile, inputEvent)
  }
}
function hoverTile(chess: Chess, hoveredTile: TileIndex | undefined, event: ProcessedSubEvent) {
  const { inputId } = event
  if (inputId in chessInputHolds) {
    const { time, tile } = chessInputHolds[inputId] as ChessInputHold
    const dt = performance.now() - time

    if (
      hoveredTile?.i !== tile.i
      || dt > holdExpireTime
    ) {
      playSound('chessCancel')
      delete chessInputHolds[inputId]
      return
    }
  }

  // tile = chess.getNearestValidMove(tile)
  if (!hoveredTile || !chess.hlTiles.allowedMoves.has(hoveredTile.i)) {
    hoveredTile = undefined
  }

  if (!isTouchDevice) {
    // show mouse hover highlight
    chess.hlTiles.hovered = hoveredTile
  }

  if (hoveredTile) {
    // chess.context.terrain.gfxHelper.setTempColorsForTile(hoverColors, tile)
    // chess.hlTiles.set(hoveredTile, 'hover')
    // chess.lastHoveredTile = hoveredTile
    document.documentElement.style.cursor = 'pointer'
    // return true // consume event
  }
  return false // do not consume event
}

export function unclickChessWorld(chess: Chess, inputEvent: ProcessedSubEvent): void {
  if (chessRun.collected.includes('dual-vector-foil')) {
    // pick flat tile in 2d view
    const flatTile = pickTileInFlatView(chess, inputEvent)
    if (flatTile) {
      unclickTile(chess, flatTile, inputEvent)
    }
  }
  else if (chess.currentPhase !== 'reward-choice') {
    // pick terrain tile in 3d view
    const { pickedTile } = inputEvent
    if (pickedTile) {
      unclickTile(chess, pickedTile, inputEvent)
    }
  }
}

// click 3d terrain chessboard
export function clickChessWorld(chess: Chess, inputEvent: ProcessedSubEvent): boolean {
  if (chessRun.collected.includes('dual-vector-foil')) {
    // pick flat tile in 2d view
    const flatTile = pickTileInFlatView(chess, inputEvent)
    if (flatTile) {
      clickTile(chess, flatTile, inputEvent)
      return true // consume event
    }
  }
  else if (chess.currentPhase !== 'reward-choice') {
    // pick terrain tile in 3d view
    const { pickedTile: pickedTileIndex } = inputEvent
    const clickedTile = pickedTileIndex
    if (!clickedTile || !chess.hlTiles.allowedMoves.has(clickedTile.i)) {
      return false // do not consume event
    }

    clickTile(chess, clickedTile, inputEvent)
    return true // consume event
  }

  return false // do not consume event
}

// tile being held by input id
type ChessInputHold = { time: number, tile: TileIndex }
const chessInputHolds: Partial<Record<InputId, ChessInputHold>> = {}

const holdExpireTime = 500 // (ms)

export function isTileHeld(tile: TileIndex) {
  const { i } = tile
  for (const hold of Object.values(chessInputHolds)) {
    if (hold && hold.tile.i === i) {
      return true
    }
  }
}

// click tile, either through flat view or 3d terrain
function clickTile(chess: Chess, clickedTile: TileIndex, event: ProcessedSubEvent) {
  // console.log('click tile', clickedTile.i)
  playSound('chessClick')
  chessInputHolds[event.inputId] = {
    time: performance.now(),
    tile: clickedTile,
  }
}

export function unclickTile(chess: Chess, unclickedTile: TileIndex, event: ProcessedSubEvent) {
  // console.log('unclickedTile tile', unclickedTile.i)
  const { inputId } = event
  if (inputId in chessInputHolds) {
    const { tile, time } = chessInputHolds[inputId] as ChessInputHold
    delete chessInputHolds[inputId]

    if (tile.i !== unclickedTile.i) {
      // unclicked on a different tile than clicked
      playSound('chessCancel')
      return
    }

    const dt = performance.now() - time
    if (dt > holdExpireTime) {
      // held for too long
      playSound('chessCancel')
      return
    }

    // detected deliberate click and unclick on the same tile
    fullClickTile(chess, tile)
  }
}

export function fullClickTile(chess: Chess, clickedTile: TileIndex) {
  // playSound('chessConfirm')

  // check if can move to clicked tile
  if (chess.hlTiles.allowedMoves.has(clickedTile.i)) {
    if (chess.currentPhase === 'player-choice') {
      chess.movePlayerToTile(clickedTile)
    }
    else if (chess.currentPhase === 'place-pawn') {
      // spawn pawn
      chessRun.hasPlacedPawn = true
      const mesh = chessPieceMeshes.pawn
      if (!mesh) {
        throw new Error('missing pawn mesh')
      }
      const spawned = chess.registerPiece('pawn', clickedTile, false)
      chess.pawns.push(spawned)
      setPiecePosition(spawned, chess.getPosOnTile(clickedTile))
      chess.cancelPlacePawn()
      chessRun.collectedPawns--
      updatePawnButtonLabel()
    }
  }
}
