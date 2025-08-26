/**
 * @file raft-clicked-tile-highlight.ts
 *
 * One thick box wireframe to highlight the selected raft tile.
 */

import { buildBoxEdges } from 'games/walking-cube/wc-edge-gfx'
import { Box3, Mesh, MeshBasicMaterial, Vector3 } from 'three'

// thick cube frame showing hovered tile in raft grid
const s = 1.2
const cursorBox = new Box3(new Vector3(-s / 2, -s / 2, -s / 2), new Vector3(s / 2, s / 2, s / 2))
export const selectedCursorMesh = new Mesh(
  buildBoxEdges({ box: cursorBox }),
  // new BoxGeometry(1.2, 1.2, 1.2),
  new MeshBasicMaterial({ color: 'white' }),
)
type CursorMode = 'default' | 'buildable'
const cursorMats: Record<CursorMode, MeshBasicMaterial> = {
  default: new MeshBasicMaterial({ color: 'white' }),
  buildable: new MeshBasicMaterial({ color: 'green' }),
}
type XZ = { x: number, z: number }
export function putSelectedCursorOnTile(tile: XZ, mode: CursorMode = 'default') {
  selectedCursorMesh.position.x = tile.x
  selectedCursorMesh.position.z = tile.z
  selectedCursorMesh.visible = true
  selectedCursorMesh.material = cursorMats[mode]
  selectedCursorMesh.frustumCulled = false
}
