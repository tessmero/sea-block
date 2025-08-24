/**
 * @file raft-mouse-input-helper.ts
 *
 * Pick raft tiles on or near moving raft.
 */

import type { ProcessedSubEvent } from 'mouse-touch-input'
import { raft } from './raft'
import { driveCamFocus, drivingRaftGroup, targetFocus } from './raft-drive-helper'
import { BoxGeometry, Mesh, MeshBasicMaterial, type Object3D, type Raycaster } from 'three'
import type { GameElement } from 'games/game'
import type { TileIndex } from 'core/grid-logic/indexed-grid'

export const cursorMesh = new Mesh(
  new BoxGeometry(1.2, 1.2, 1.2),
  new MeshBasicMaterial({ color: 'white' }),
)
export const cursorElement: GameElement = {
  meshLoader: async () => { return cursorMesh },
}

type XZ = { x: number, z: number }

type CursorMode = 'default' | 'buildable'

const cursorMats: Record<CursorMode, MeshBasicMaterial> = {
  default: new MeshBasicMaterial({ color: 'white' }),
  buildable: new MeshBasicMaterial({ color: 'green' }),
}

function putCursorOnTile(tile: XZ, mode: CursorMode = 'default') {
  cursorMesh.position.x = tile.x
  cursorMesh.position.z = tile.z
  cursorMesh.visible = true
  cursorMesh.material = cursorMats[mode]
  cursorMesh.frustumCulled = false
  document.documentElement.style.cursor = 'pointer'
}

export function hoverRaftWorld(inputEvent: ProcessedSubEvent) {
  cursorMesh.visible = false

  if (targetFocus === 0 || driveCamFocus < 0.9) {
    return false // disable hovering individual pieces while not focused
  }

  // check if mouse is on existing part of raft
  const pickedPiece = raft.getPickedPieceMesh(inputEvent)
  if (pickedPiece) {
    // console.log('hoverRaftWorld existing piece', pickedPiece)

    // if (raft.hlTiles.buildable.has(pickedPiece.tile.i)) {
    putCursorOnTile({
      x: pickedPiece.tile.x - raft.centerTile.x,
      z: pickedPiece.tile.z - raft.centerTile.z,
    })
    // }
  }
  else {
    const raftTile = pickRaftTile(inputEvent)
    // putCursorOnTile(raftTile)
    // console.log('hoverRaftWorld raft tile', raftTile)

    const tileIndex = raft.grid.xzToIndex(
      raft.centerTile.x + raftTile.x,
      raft.centerTile.z + raftTile.z,
    )
    if (tileIndex) {
      if (raft.hlTiles.buildable.has(tileIndex.i)) {
        putCursorOnTile(raftTile, 'buildable')
      }
    }
  }
  return true // consume event
}

export function clickRaftWorld(inputEvent: ProcessedSubEvent): boolean {
  if (targetFocus === 0 || driveCamFocus < 0.9) {
    return false // disable clicking individual pieces while not focused
  }

  let tileIndex: TileIndex | undefined

  // check if mouse is on existing part of raft
  const pickedPiece = raft.getPickedPieceMesh(inputEvent)
  if (pickedPiece) {
    // console.log('clickRaftWorld existing piece', pickedPiece)
    tileIndex = pickedPiece.tile
  }
  else {
    const raftTile = pickRaftTile(inputEvent)
    // console.log('clickRaftWorld raft tile', raftTile)

    tileIndex = raft.grid.xzToIndex(
      raft.centerTile.x + raftTile.x,
      raft.centerTile.z + raftTile.z,
    )
  }

  if (tileIndex) {
    // console.log('clicked tile index')

    if (raft.hlTiles.buildable.has(tileIndex.i)) {
      // console.log('clicked tile index BUILDABLE')
      // clicked buildable tile
      raft.buildPiece('thruster', tileIndex)
      return true // consume event
    }
  }

  if (targetFocus === 1 && !inputEvent.pickedMesh) {
    // prevent camera drag while focused on raft
    return true // consume event
  }
  return false
}

function pickRaftTile(inputEvent: ProcessedSubEvent): XZ {
  const surface: Object3D = drivingRaftGroup
  const raycaster: Raycaster = inputEvent.raycaster

  // Assume the raft is a flat square in the XZ plane, centered at (0,0,0), y=0
  // We'll intersect the ray with the y=0 plane in the local space of the raft
  const origin = raycaster.ray.origin.clone()
  const direction = raycaster.ray.direction.clone()

  // Transform ray into local space of the raft
  const invMatrix = surface.matrixWorld.clone().invert()
  origin.applyMatrix4(invMatrix)
  direction.transformDirection(invMatrix)

  // Ray-plane intersection (y=0)
  if (Math.abs(direction.y) < 1e-6) {
    // Ray is parallel to the raft surface
    return { x: 0, z: 0 }
  }
  const t = -origin.y / direction.y
  const intersect = origin.clone().add(direction.multiplyScalar(t))

  // Round to nearest integer tile
  return { x: Math.round(intersect.x), z: Math.round(intersect.z) }
}
