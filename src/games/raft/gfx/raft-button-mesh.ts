/**
 * @file raft-button-mesh.ts
 *
 * Appears as outlined square on top of a raft floor tile.
 */

import { BoxGeometry, InstancedMesh, MeshLambertMaterial } from 'three'

const box = (x, y, z) => new BoxGeometry(x, y, z)
const mat = pars => new MeshLambertMaterial(pars)
export function buildRaftButtonMesh(maxInstances: number) {
  return new InstancedMesh(
    box(0.9, 1, 0.9).translate(0, 0.05, 0), // appears as square on top of floor
    mat({ color: 0xffffff }),
    maxInstances,
  )
}
