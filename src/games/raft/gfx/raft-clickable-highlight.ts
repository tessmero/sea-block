/**
 * @file raft-clickable-highlight.ts
 *
 * Pulsing dots that indicate clickable raft tiles in the current phase.
 */

import { BoxGeometry, InstancedMesh, Matrix4, MeshBasicMaterial } from 'three'
import { raft } from '../raft'
import type { TileIndex } from 'core/grid-logic/indexed-grid'

// instanced mesh to visualize buildable tiles
const buildableMat = new MeshBasicMaterial({ color: 'white', depthTest: false, depthWrite: false })
export const clickablesMesh: InstancedMesh
    = new InstancedMesh(new BoxGeometry(1, 1, 1).scale(0.1, 0.1, 0.1), buildableMat, 100)
clickablesMesh.renderOrder = 999 // on top
clickablesMesh.count = 0
let buildableY = 0
export function showRaftClickables() {
  clickablesMesh.count = 0
  buildableY = raft.currentPhase === 'place-button' ? 0.5 : 0 // indicate buttons on top of surface
  for (const i of raft.hlTiles.clickable) {
    _registerClickable(raft.grid.tileIndices[i])
  }
  clickablesMesh.instanceMatrix.needsUpdate = true
}
export function hideRaftClickables() {
  clickablesMesh.count = 0
}

const m4 = new Matrix4()
function _registerClickable(tile: TileIndex) {
  const { x, z } = raft.getPosOnTile(tile)
  m4.setPosition(x - 0.5, buildableY, z - 0.5) // center or top-center of tile
  const index = clickablesMesh.count++
  clickablesMesh.setMatrixAt(index, m4)
}
