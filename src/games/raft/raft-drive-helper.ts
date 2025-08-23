/**
 * @file raft-drive-helper.ts
 *
 * Helper for raft-drive game.
 */
import type { GameElement, GameUpdateContext } from 'games/game'
import { getLeftJoystickInput, orbitWithRightJoystick } from 'guis/elements/joysticks'
import { wasdInputState } from 'guis/elements/wasd-buttons'
import type { SeaBlock } from 'sea-block'
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Vector2 } from 'three'
import type { RaftRig } from './raft-physics'
import { buildRaftRig } from './raft-physics'

export const drivingRaftGroup = new Group()
drivingRaftGroup.add(new Mesh(
  new BoxGeometry(1, 1, 1),
  new MeshBasicMaterial({ color: 'red' })))

export const drivingRaftElement = {
  meshLoader: async () => {
    return drivingRaftGroup
  },
} satisfies GameElement

const forward = new Vector2(0, 1)
const right = new Vector2(1, 0)
const moveVec = new Vector2(0, 0)

let rig: RaftRig // physics object made of spheres

export function resetRaftDrive(context: SeaBlock) {
  rig = buildRaftRig(context)
}

export function updateRaftDrive(context: GameUpdateContext) {
  const { seaBlock, dt } = context

  rig.update(dt)
  rig.alignMesh(drivingRaftGroup)

  // 3. Build movement vector from input
  const isUpHeld = wasdInputState['upBtn']
  const isDownHeld = wasdInputState['downBtn']
  const isLeftHeld = wasdInputState['leftBtn']
  const isRightHeld = wasdInputState['rightBtn']

  // WASD input
  moveVec.set(0, 0)
  if (isUpHeld) moveVec.add(forward)
  if (isDownHeld) moveVec.sub(forward)
  if (isLeftHeld) moveVec.add(right)
  if (isRightHeld) moveVec.sub(right)

  // let moveMagnitude = 0
  // if (moveVec.lengthSq() > 0) {
  //   // moveVec.normalize()
  //   moveMagnitude = 1
  // }

  // joystick input
  const joyInput = getLeftJoystickInput()
  if (joyInput) {
    const { x, y } = joyInput
    // moveMagnitude = Math.min(1, (Math.hypot(x, y) - leftDead) * 2)
    moveVec.addScaledVector(right, -x)
    moveVec.addScaledVector(forward, -y)
  }
  orbitWithRightJoystick(seaBlock, dt) // gui/elements/joysticks.ts
  seaBlock.orbitControls.update()

  // if (moveVec.x !== 0 || moveVec.z !== 0) {
  //   raftVel.set(moveVec.x, 0, moveVec.z).normalize().multiplyScalar(DRIVE_SPEED * dt)
  //   raftAngle = Math.atan2(moveVec.x, moveVec.z) + Math.PI // set forward to match chess camera
  // }
  // else {
  //   raftVel.set(0, 0, 0)
  // }
  // drivingRaftGroup.position.add(raftVel)
  // drivingRaftGroup.setRotationFromAxisAngle(upAxis, raftAngle)

  if (moveVec.y > 0) {
    rig.applyForwardThrust(moveVec.y * 4e-4)
  }
  rig.applyTorque(moveVec.x * 4e-4)
}
