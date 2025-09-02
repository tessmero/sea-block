/**
 * @file chess-ggui-nav.ts
 *
 * Chess Gamepad Graphical User Interface navigator.
 * Navigate 2d or 3d chess board with gamepad.
 */

import { Vector2 } from 'three'
import { chessRun } from './chess-run'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { Chess } from './chess-helper'
import { gguiCursorMesh, setGguiNavAction, setGguiSelectAction } from 'gfx/3d/ggui-3d-cursor'
import { setGamepadConfirmPrompt } from 'gfx/2d/gamepad-btn-prompts'
import { clickTile, getFlatViewTileRect, resetHeldChessInputs, unclickTile } from './chess-input-helper'

const targetVec = new Vector2()
// const dummyVec = new Vector2()

export function putGguiCursorOnSomeValidMove(instance: Chess, startFrom?: TileIndex, angle?: number) {
  const is2d = chessRun.collected.includes('dual-vector-foil')

  targetVec.set(0, 0)
  if (startFrom && (typeof angle === 'number')) {
    const seaBlock = instance.context
    let camAngle = 0
    if (!is2d) {
      // adjust for camera angle in 3d world
      const { camera, orbitControls } = seaBlock
      camAngle = -Math.PI / 2 + Math.atan2(
        camera.position.z - orbitControls.target.z,
        camera.position.x - orbitControls.target.x,
      )
    }
    targetVec.set(
      startFrom.x + Math.cos(angle + camAngle),
      startFrom.z + Math.sin(angle + camAngle),
    )
  }

  // console.log(`chess ggui nav with angle ${angle}`)

  const candidates = [...instance.hlTiles.allowedMoves]
  let nearest: TileIndex | null = null
  let nearestDistSq = Infinity
  for (const i of candidates) {
    if (startFrom && startFrom.i === i) continue
    const tileIndex = instance.context.terrain.grid.tileIndices[i]
    const dx = tileIndex.x - targetVec.x
    const dz = tileIndex.z - targetVec.y
    const distSq = dx * dx + dz * dz
    if (distSq < nearestDistSq) {
      nearest = tileIndex
      nearestDistSq = distSq
    }
  }

  if (nearest) {
    const tileIndex = nearest
    instance.hlTiles.hovered = tileIndex // color tile liek mouse hover

    if (is2d) {
      // chess is in 2D mode, not rendering world
      const rect = getFlatViewTileRect(instance, tileIndex)
      if (rect) {
        setGamepadConfirmPrompt(rect)
      }
    }
    else {
      // place cursor in 3d world
      instance.getPosOnTile(tileIndex, gguiCursorMesh.position)
      gguiCursorMesh.visible = true
      setGamepadConfirmPrompt(gguiCursorMesh.position)
    }

    //
    setGguiSelectAction((inputId, axisValue) => {
      if (axisValue) {
        clickTile(instance, tileIndex, inputId)
      }
      else {
        unclickTile(instance, tileIndex, inputId)
      }
    })
    setGguiNavAction((angle) => {
      resetHeldChessInputs()
      putGguiCursorOnSomeValidMove(instance, tileIndex, angle)
    })
  }
}
