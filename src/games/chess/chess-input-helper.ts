/**
 * @file chess-input-helper.ts
 *
 * Handlers for mouse/touch inputs on chessboard flat view / terrain tiles.
 */

import { isTouchDevice, type ProcessedSubEvent } from 'input/mouse-touch-input'
import { chessRun } from './chess-run'
import type { Chess } from './chess-helper'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import {
  instancedPieceMeshes, registerInstancedPiece,
  setPiecePosition, treasureChestElement,
} from './gfx/chess-3d-gfx-helper'
import type { InputId } from 'input/input-id'
import { playSound } from 'audio/sound-effects'
import { updatePawnButtonLabel } from './gfx/chess-2d-gfx-helper'
import type { PieceName } from './chess-enums'
import type { Intersection } from 'three'
import { togglePauseMenu } from './gui/chess-hud-dialog-elements'

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

// handle move that wasn't consumed by regular gui or orbit controls
export function hoverChessWorld(chess: Chess, inputEvent: ProcessedSubEvent) {
  if (chess.currentPhase === 'game-over') {
    return
  }
  // if (inputEvent.seaBlock.config.flatConfig.chessViewMode === '2D') {
  if (chessRun.collected.includes('dual-vector-foil')) {
    // hover 2d tile
    const flatTile = pickTileInFlatView(chess, inputEvent)
    hoverTile(chess, flatTile, inputEvent)
  }
  else if (chess.currentPhase === 'reward-choice') {
    // do nothing
  }
  else {
    // check for mesh on 3d tile
    const pickedPieceMesh = getPickedPieceMesh(chess, inputEvent)

    if (pickedPieceMesh) {
      // act like hovering tile under piece
      hoverTile(chess, pickedPieceMesh.tile, inputEvent)
    }
    else {
      // hover 3d tile
      hoverTile(chess, inputEvent.pickedTile, inputEvent)
    }
  }
}

// handle click that wasn't consumed by regular gui
export function clickChessWorld(chess: Chess, inputEvent: ProcessedSubEvent): boolean {
  togglePauseMenu(chess, false)
  if (chess.currentPhase === 'game-over') {
    return false
  }
  if (chessRun.collected.includes('dual-vector-foil')) {
    // pick flat tile in 2d view
    const flatTile = pickTileInFlatView(chess, inputEvent)
    if (flatTile) {
      clickTile(chess, flatTile, inputEvent)
      return true // consume event
    }
  }
  else if (chess.currentPhase === 'reward-choice') {
    // do nothing
  }
  else {
    // check for mesh on tile
    const pickedPieceMesh = getPickedPieceMesh(chess, inputEvent)

    if (pickedPieceMesh) {
      // act like clicking tile under piece
      clickTile(chess, pickedPieceMesh.tile, inputEvent)
      return true // consume event
    }

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

// handle mouseup
export function unclickChessWorld(chess: Chess, inputEvent: ProcessedSubEvent): void {
  if (chessRun.collected.includes('dual-vector-foil')) {
    // pick flat tile in 2d view
    const flatTile = pickTileInFlatView(chess, inputEvent)
    if (flatTile) {
      unclickTile(chess, flatTile, inputEvent)
    }
  }
  else if (chess.currentPhase === 'reward-choice') {
    // do nothing
  }
  else {
    // check for mesh on tile
    const pickedPieceMesh = getPickedPieceMesh(chess, inputEvent)

    if (pickedPieceMesh) {
      // act like unclicking tile under piece
      unclickTile(chess, pickedPieceMesh.tile, inputEvent)
    }
    else if (inputEvent.pickedTile) {
      // pick terrain tile in 3d view
      unclickTile(chess, inputEvent.pickedTile, inputEvent)
    }
    else {
      // unclick OOB
      playSound('chessCancel')
    }
  }
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

export function resetHeldChessInputs() {
  for (const inputId in chessInputHolds) {
    delete chessInputHolds[inputId]
  }
}

// called periodically, make holds expire over time
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

function hoverTile(chess: Chess, hoveredTile: TileIndex | undefined, event: ProcessedSubEvent) {
  const { inputId } = event

  // console.log('hover tile', JSON.stringify(hoveredTile))

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

// called after deliberate short press and unpress on a piece/tile
function fullClickTile(chess: Chess, clickedTile: TileIndex) {
  // playSound('chessConfirm')

  // check if can move to clicked tile
  if (chess.hlTiles.allowedMoves.has(clickedTile.i)) {
    if (chess.currentPhase === 'player-choice') {
      chess.movePlayerToTile(clickedTile)
    }
    else if (chess.currentPhase === 'place-pawn') {
      // spawn pawn
      chessRun.hasPlacedPawn = true
      const mesh = instancedPieceMeshes.pawn
      if (!mesh) {
        throw new Error('missing pawn mesh')
      }
      const spawned = registerInstancedPiece('pawn', clickedTile, false)
      chess.pawns.push(spawned)
      setPiecePosition(spawned, chess.getPosOnTile(clickedTile))
      chess.cancelPlacePawn()
      chessRun.collectedPawns--
      updatePawnButtonLabel()
    }
  }
  else {
    // not an allowed move
    playSound('chessCancel')
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
      const { x, y, w, h } = rectangle
      // check if lvPos is inside rectangle
      if (
        lvPos.x >= x && lvPos.x < x + w
        && lvPos.y >= y && lvPos.y < y + h
      ) {
        // point is inside flat view
        const col = (lvPos.x - x) / 16
        const row = (lvPos.y - y) / 16
        const tile = chess.context.terrain.grid.xzToIndex(
          Math.floor(chess.centerTile.x + col - 3),
          Math.floor(chess.centerTile.z + row - 3),
        )
        return tile
      }
    }
  }
}

// pick chess piece or treasure chest
function getPickedPieceMesh(chess: Chess, inputEvent: ProcessedSubEvent): { tile: TileIndex } | undefined {
  // hover mesh on 3d tile
  const { pickedMesh } = inputEvent
  if (pickedMesh) {
    // console.log('chess input picked mesh')

    // check for extra propertu assigned in game.ts
    const elem = (pickedMesh as any).gameElement// eslint-disable-line @typescript-eslint/no-explicit-any

    if (elem === treasureChestElement) {
      // picked goal mesh
      return { tile: chess.goalTile }
    }

    if (elem === chess.playerElement) {
      // picked player chess piece
      return { tile: chess.player.tile }
    }

    else if (elem && 'pieceType' in elem) {
      // picked instanced chess piece
      // console.log('chess input picked mesh with piecetype in element')
      const pieceType = elem.pieceType as PieceName
      const { instanceId } = inputEvent.rawPick as Intersection
      if (typeof instanceId === 'number') {
        // console.log('chess input picked instnaceId')
        return chess.identifyPiece(pieceType, instanceId)
      }
    }
  }
}
