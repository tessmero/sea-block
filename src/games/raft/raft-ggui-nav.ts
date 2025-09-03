/**
 * @file raft-ggui-nav.ts
 *
 * Gamepad Graphical User Interface navigator.
 * Navigate between clickable tiles during raft building phases.
 */

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { raft } from './raft'
import { Vector2, Vector3 } from 'three'
import { _hoverRaftTile, clickRaftTile } from './raft-mouse-input-helper'
import { gguiCursorMesh, setGguiHandler } from 'gfx/3d/ggui-3d-cursor'
import { setGamepadConfirmPrompt } from 'gfx/2d/gamepad-btn-prompts'
import { resetHeldChessInputs } from 'games/chess/chess-input-helper'
import { drivingRaftGroup } from './raft-drive-helper'

const targetVec = new Vector2()
const dummy = new Vector3()

export function putGguiCursorOnSomeClickable(startFrom?: TileIndex, angle?: number) {
  targetVec.set(0, 0)
  if (startFrom && (typeof angle === 'number')) {
    const seaBlock = raft.context
    // adjust for camera angle in 3d world
    const { camera, orbitControls } = seaBlock
    const camAngle = -Math.PI / 2 + Math.atan2(
      camera.position.z - orbitControls.target.z,
      camera.position.x - orbitControls.target.x,
    )
    // adjust for raft angle in 3d world
    drivingRaftGroup.getWorldDirection(dummy)
    const raftAngle = -Math.PI / 2 + Math.atan2(dummy.z, dummy.x)
    // console.log('cam', camAngle, 'raft', raftAngle)
    targetVec.set(
      startFrom.x + Math.cos(angle + camAngle - raftAngle),
      startFrom.z + Math.sin(angle + camAngle - raftAngle),
    )
  }

  const candidates = raft.currentPhase === 'idle' ? raft.allTiles : [...raft.hlTiles.clickable]
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

    // place cursor in 3d world
    raft.getPosOnTile(tileIndex, gguiCursorMesh.position)
    drivingRaftGroup.updateMatrixWorld()
    gguiCursorMesh.position.applyMatrix4(drivingRaftGroup.matrixWorld)

    gguiCursorMesh.visible = true
    setGamepadConfirmPrompt(gguiCursorMesh.position)

    //
    setGguiHandler({
      selectAction: (inputId, axisValue) => {
        if (axisValue === 1) {
          clickRaftTile(raftTile, tileIndex)
          return true // consume event
        }
        else {
        // unclickTile(raftTile, tileIndex)
        }
      },
      navAction: (angle) => {
        resetHeldChessInputs()
        putGguiCursorOnSomeClickable(tileIndex, angle)
      },
    })
  }
}
