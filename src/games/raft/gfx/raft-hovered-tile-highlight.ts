/**
 * @file raft-hovered-tile-highlight.ts
 *
 * One thick box wireframe to highlight the hovered raft tile.
 */

import { buildBoxEdges } from 'games/walking-cube/wc-edge-gfx'
import { Box3, Mesh, MeshBasicMaterial, Vector3 } from 'three'

// thick cube frame showing hovered tile in raft grid
const s = 1.2
const cursorBox = new Box3(new Vector3(-s / 2, -s / 2, -s / 2), new Vector3(s / 2, s / 2, s / 2))
export const hoverCursorMesh = new Mesh(
  buildBoxEdges({
    box: cursorBox,
    thickness: 0.05, // thinner than selected cursor
  }),
  // new BoxGeometry(1.2, 1.2, 1.2),
  new MeshBasicMaterial({ color: 'white' }),
)
type CursorMode = 'default' | 'buildable'
const cursorMats: Record<CursorMode, MeshBasicMaterial> = {
  default: new MeshBasicMaterial({ color: 0xcccccc }),
  buildable: new MeshBasicMaterial({ color: 'white' }),
}
type XZ = { x: number, z: number }
export function putHoverCursorOnTile(tile: XZ, mode: CursorMode = 'default') {
  hoverCursorMesh.position.x = tile.x
  hoverCursorMesh.position.z = tile.z
  hoverCursorMesh.visible = true
  hoverCursorMesh.material = cursorMats[mode]
  hoverCursorMesh.frustumCulled = false
}
export function resetHoverCursorMode() {
  hoverCursorMesh.material = cursorMats['default']
}
