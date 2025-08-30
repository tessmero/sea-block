/**
 * @file raft-mouse-input-helper.ts
 *
 * Pick raft tiles on or near moving raft.
 */

import type { ProcessedSubEvent } from 'input/mouse-touch-input'
import { raft } from './raft'
import { drivingRaftGroup } from './raft-drive-helper'
import { type Object3D, type Raycaster } from 'three'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { clickedPiece, hidePieceDialog, showPieceClicked, showPieceHovered } from './gui/raft-piece-dialog'
import { hoverCursorMesh, putHoverCursorOnTile } from './gfx/raft-hovered-tile-highlight'
import { showRaftWires } from './gfx/raft-wires-overlay'

const camDistancethreshold = 20 // distance where individual pieces become pickable

type XZ = { x: number, z: number }

export function hoverRaftWorld(inputEvent: ProcessedSubEvent) {
  // if (targetFocus === 0 || driveCamFocus < 0.9) {
  //   return false // disable hovering individual pieces while not focused
  // }
  if (raft.cameraDistance > camDistancethreshold) {
    return false // disable hovering individual pieces while zoomed out
  }

  // // check if mouse is on existing part of raft
  // const pickedPiece = raft.getPickedPieceMesh(inputEvent)
  // if (pickedPiece && raft.currentPhase === 'idle') {
  //   // console.log('hoverRaftWorld existing piece', pickedPiece)

  //   putCursorOnTile({
  //     x: pickedPiece.tile.x - raft.centerTile.x,
  //     z: pickedPiece.tile.z - raft.centerTile.z,
  //   })
  //   showPieceHovered(pickedPiece)
  //   // if (raft.hlTiles.buildable.has(pickedPiece.tile.i)) {
  //   //   document.documentElement.style.cursor = 'pointer'
  //   // }
  // }
  // else {

  // hide cursor by default, may be reinstated below
  hoverCursorMesh.visible = false

  if (!clickedPiece) {
    // hide cursor and info by default, they may be reinstated below
    selectedCursorMesh.visible = false
    hidePieceDialog(inputEvent.seaBlock)
  }

  const raftTile = pickRaftTile(inputEvent)
  // putCursorOnTile(raftTile)
  // console.log('hoverRaftWorld raft tile', raftTile)

  const tileIndex = raft.grid.xzToIndex(
    raft.centerTile.x + raftTile.x,
    raft.centerTile.z + raftTile.z,
  )
  if (tileIndex) {
    _hoverRaftTile(raftTile, tileIndex)
  }
  // }
  return true // consume event
}

function _hoverRaftTile(raftTile: XZ, tileIndex: TileIndex) {
  if (raft.currentPhase !== 'edit-button' && raft.hlTiles.clickable.has(tileIndex.i)) {
    // if (!clickedPiece) {
    putHoverCursorOnTile(raftTile, 'buildable')
    // }
  }
  else {
    putHoverCursorOnTile(raftTile, 'default')
    if (!clickedPiece) {
      const piece = raft.getRelevantPiece(tileIndex)
      if (piece) {
        showPieceHovered(piece)

        // any piece can be clicked and selected
        document.documentElement.style.cursor = 'pointer'
      }
    }
  }
}

export function clickRaftWorld(inputEvent: ProcessedSubEvent): boolean {
  // if (targetFocus === 0 || driveCamFocus < 0.9) {
  //   return false // disable clicking individual pieces while not focused
  // }
  if (raft.cameraDistance > camDistancethreshold) {
    return false // disable clicking individual pieces while zoomed out
  }

  // let tileIndex: TileIndex | undefined

  // // check if mouse is on existing part of raft
  // const pickedPiece = raft.getPickedPieceMesh(inputEvent)
  // if (pickedPiece) {
  //   // console.log('clickRaftWorld existing piece', pickedPiece)
  //   tileIndex = pickedPiece.tile
  // }
  // else {
  const raftTile = pickRaftTile(inputEvent)
  // console.log('clickRaftWorld raft tile', raftTile)

  const tileIndex = raft.grid.xzToIndex(
    raft.centerTile.x + raftTile.x,
    raft.centerTile.z + raftTile.z,
  )
  // }

  if (tileIndex) {
    const piece = raft.getRelevantPiece(tileIndex)
    // console.log('clicked tile index')

    if (raft.hlTiles.clickable.has(tileIndex.i)) {
      // console.log('clicked tile index BUILDABLE')
      // clicked buildable tile
      if (raft.currentPhase === 'place-thruster') {
        raft.buildPiece('thruster', tileIndex)
        raft.hlTiles.updateBuildableTiles('thruster')
        _hoverRaftTile(raftTile, tileIndex)
        return true // consume event
      }
      else if (raft.currentPhase === 'place-floor') {
        raft.buildPiece('floor', tileIndex)
        raft.hlTiles.updateBuildableTiles('floor')
        _hoverRaftTile(raftTile, tileIndex)
        return true // consume event
      }
      else if (raft.currentPhase === 'place-button') {
        raft.buildPiece('button', tileIndex, [])
        raft.hlTiles.updateBuildableTiles('button')
        _hoverRaftTile(raftTile, tileIndex)
        return true // consume event
      }
      else if (
        raft.currentPhase === 'edit-button'
        && raft.editingButton && piece?.type === 'thruster'
      ) {
        // toggle wire connection
        const i = raft.raftPieces.indexOf(piece)
        const thruster = raft.thrusters.find(({ pieceIndex }) => pieceIndex === i)
        if (thruster) {
          const { triggers } = raft.editingButton
          if (triggers.includes(thruster)) {
            // break wire
            triggers.splice(triggers.indexOf(thruster), 1)
          }
          else {
            // add wire
            triggers.push(thruster)
          }
          showRaftWires(raft.editingButton)
        }
      }
    }
    else {
      // tile not buildable
      putHoverCursorOnTile(raftTile, 'default')

      if (raft.currentPhase === 'edit-button' && piece) {
        raft.startPhase('idle') // can deslect button by clicking another piece
      }

      if (piece) {
        if (piece.type === 'button') {
          showPieceClicked(piece)
          const i = raft.raftPieces.indexOf(piece)
          raft.editingButton = raft.buttons.find(({ pieceIndex }) => pieceIndex === i)
          raft.startPhase('edit-button')
          setRaftToolbarPressed() // release raft toolbar buttons
          showRaftWires(raft.editingButton)
          raft.hlTiles.highlightThrusters()
        }
        else {
          // may cancel build phase by clicking piece on non-buildable tile
          raft.startPhase('idle')
          showPieceClicked(piece)
        }
      }
      else {
        // no piece on picked tile
        if (raft.currentPhase !== 'edit-button') {
          selectedCursorMesh.visible = false
          hidePieceDialog(raft.context)
        }
      }
    }
  }

  // if (targetFocus === 1 && !inputEvent.pickedMesh) {
  //   // prevent camera drag while focused on raft
  //   return true // consume event
  // }
  return false
}

// Dummy objects to avoid allocations in pickRaftTile
import { Vector3, Matrix4 } from 'three'
import { selectedCursorMesh } from './gfx/raft-clicked-tile-highlight'
import { setRaftToolbarPressed } from './gui/raft-toolbar-elements'
const _raftOrigin = new Vector3()
const _raftDirection = new Vector3()
const _raftInvMatrix = new Matrix4()
const _raftIntersect = new Vector3()

function pickRaftTile(inputEvent: ProcessedSubEvent): XZ {
  const surface: Object3D = drivingRaftGroup
  const raycaster: Raycaster = inputEvent.raycaster

  // Assume the raft is a flat square in the XZ plane, centered at (0,0,0), y=0
  // We'll intersect the ray with the y=0 plane in the local space of the raft
  _raftOrigin.copy(raycaster.ray.origin)
  _raftDirection.copy(raycaster.ray.direction)

  // Transform ray into local space of the raft
  _raftInvMatrix.copy(surface.matrixWorld).invert()
  _raftOrigin.applyMatrix4(_raftInvMatrix)
  _raftDirection.transformDirection(_raftInvMatrix)

  // Ray-plane intersection (y=0)
  if (Math.abs(_raftDirection.y) < 1e-6) {
    // Ray is parallel to the raft surface
    return { x: 0, z: 0 }
  }
  const t = -_raftOrigin.y / _raftDirection.y
  _raftIntersect.copy(_raftOrigin).add(_raftDirection.multiplyScalar(t))

  // Round to nearest integer tile
  return { x: Math.round(_raftIntersect.x), z: Math.round(_raftIntersect.z) }
}
