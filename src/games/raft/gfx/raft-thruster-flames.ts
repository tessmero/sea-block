/**
 * @file raft-thruster-flames.ts
 *
 * Manage graphics to represent firing thrusters.
 */

import { InstancedMesh, MeshBasicMaterial, SphereGeometry } from 'three'
import { raft } from '../raft'
import type { AutoThruster } from '../raft-auto-thrusters'
import { getThrusterRotationMatrix } from './raft-gfx-helper'

const flameGeom = new SphereGeometry(0.3, 6, 6).translate(0, -0.7, 0)
const flameMat = new MeshBasicMaterial({ color: 'orange' })
export const flamesMesh = new InstancedMesh(flameGeom, flameMat, 25)

export function updateRaftThrusterFlames() {
  flamesMesh.count = 0
  for (const thruster of raft.thrusters) {
    if (thruster.isFiring) {
      _registerInstance(thruster)
    }
  }
  flamesMesh.instanceMatrix.needsUpdate = true
}

export function hideRaftThrusterFlames() {
  flamesMesh.count = 0
}

function _registerInstance(thruster: AutoThruster) {
  const { direction, dx, dz } = thruster

  const index = flamesMesh.count++

  const m4 = getThrusterRotationMatrix(direction)

  m4.setPosition(dx, 0, dz)
  flamesMesh.setMatrixAt(index, m4)
}
