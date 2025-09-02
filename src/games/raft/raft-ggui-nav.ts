/**
 * @file raft-ggui-nav.ts
 *
 * Gamepad Graphical User Interface navigator.
 * Navigate between clickable tiles during raft building phases.
 */

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { raft } from './raft'
import { Vector2 } from 'three'
import { _hoverRaftTile, clickRaftTile } from './raft-mouse-input-helper'
import { gguiCursorMesh, setGguiNavAction, setGguiSelectAction } from 'gfx/3d/ggui-3d-cursor'
import { setGamepadConfirmPrompt } from 'gfx/2d/gamepad-btn-prompts'
import { resetHeldChessInputs } from 'games/chess/chess-input-helper'
import { drivingRaftGroup } from './raft-drive-helper'

const targetVec = new Vector2()

export function putGguiCursorOnSomeClickable(startFrom?: TileIndex, angle?: number) {
  targetVec.set(0, 0)
  const is2d = false
  if (startFrom && (typeof angle === 'number')) {
    const seaBlock = raft.context
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

  const candidates = [...raft.hlTiles.clickable]
  let nearest: TileIndex | null = null
  let nearestDistSq = Infinity
  for (const i of candidates) {
    if (startFrom && startFrom.i === i) continue
    const tileIndex = raft.grid.tileIndices[i]
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
    const raftTile = {
      x: tileIndex.x - raft.centerTile.x,
      z: tileIndex.z - raft.centerTile.z,
    }
    _hoverRaftTile(raftTile, tileIndex) // color tile liek mouse hover

    if (is2d) {
    //   // chess is in 2D mode, not rendering world
    //   const rect = getFlatViewTileRect(instance, tileIndex)
    //   if (rect) {
    //     setGamepadConfirmPrompt(rect)
    //   }
    }
    else {
      // place cursor in 3d world
      raft.getPosOnTile(tileIndex, gguiCursorMesh.position)
      drivingRaftGroup.updateMatrixWorld()
      gguiCursorMesh.position.applyMatrix4(drivingRaftGroup.matrixWorld)

      gguiCursorMesh.visible = true
      setGamepadConfirmPrompt(gguiCursorMesh.position)
    }

    //
    setGguiSelectAction((inputId, axisValue) => {
      if (axisValue) {
        clickRaftTile(raftTile, tileIndex)
      }
      else {
        // unclickTile(raftTile, tileIndex)
      }
    })
    setGguiNavAction((angle) => {
      resetHeldChessInputs()
      putGguiCursorOnSomeClickable(tileIndex, angle)
    })
  }
}
