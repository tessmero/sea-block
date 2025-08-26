/**
 * @file raft-wires-overlay.ts
 *
 * Rods connecting buttons to thrusters they trigger.
 */

import { BoxGeometry, InstancedMesh, Matrix4, MeshBasicMaterial, Vector3 } from 'three'
import type { RaftButton } from '../raft-buttons'
import type { AutoThruster } from '../raft-auto-thrusters'
import { raft } from '../raft'

// instanced mesh to visualize connections between buttons and thrusters
const wireMat = new MeshBasicMaterial({ color: 'white', depthTest: false, depthWrite: false })
export const wiresMesh: InstancedMesh = new InstancedMesh(new BoxGeometry(1, 1, 1), wireMat, 100)
wiresMesh.renderOrder = 999 // on top
wiresMesh.count = 0
// export const wiresElement: GameElement = {
//   meshLoader: async () => { return wiresMesh },
// }
export function showRaftWires(onlyFor?: RaftButton) {
  wiresMesh.count = 0
  if (onlyFor) {
    for (const thruster of onlyFor.triggers) {
      _registerWire(onlyFor, thruster)
    }
  }
  else {
    for (const button of raft.buttons) {
      for (const thruster of button.triggers) {
        _registerWire(button, thruster)
      }
    }
  }
  wiresMesh.instanceMatrix.needsUpdate = true
}
export function hideRaftWires() {
  wiresMesh.count = 0
}
// Pre-allocated vectors and matrix for _registerWire
const _posA = new Vector3()
const _posB = new Vector3()
const _mid = new Vector3()
const _dir = new Vector3()
const _zAxis = new Vector3()
const _axis = new Vector3()
const _ref = new Vector3()
const _scale = new Vector3()
const _m4 = new Matrix4()

function _registerWire(button: RaftButton, thruster: AutoThruster) {
  _posA.set(button.dx, 0.5, button.dz) // top center of button tile
  _posB.set(thruster.dx, 0, thruster.dz) // center of thruster tile

  // Compute midpoint and direction
  _mid.addVectors(_posA, _posB).multiplyScalar(0.5)
  _dir.subVectors(_posB, _posA)
  const length = _dir.length()
  if (length < 1e-6) {
    throw new Error('wire is too short')
  }

  // Default box is 1x1x1, so scale z to length, rotate to align with dir
  _m4.identity()
  // Align Z axis to dir
  _zAxis.copy(_dir).normalize()
  // Find rotation axis and angle from (0,0,1) to zAxis
  let angle: number | undefined
  if (_ref.set(0, 0, 1).angleTo(_zAxis) >= 1e-6) {
    _axis.crossVectors(_ref, _zAxis).normalize()
    angle = Math.acos(_ref.dot(_zAxis))
    if (_axis.lengthSq() >= 1e-6 && angle !== undefined) {
      _m4.makeRotationAxis(_axis, angle)
    }
  }
  _scale.set(0.08, 0.08, length)
  _m4.scale(_scale)
  _m4.setPosition(_mid.x, _mid.y, _mid.z)

  const index = wiresMesh.count++
  wiresMesh.setMatrixAt(index, _m4)
}
