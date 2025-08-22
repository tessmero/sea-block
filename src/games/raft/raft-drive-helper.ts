/**
 * @file raft-drive-helper.ts
 *
 * Helper for raft-drive game.
 */
import type { GameElement, GameUpdateContext } from 'games/game'
import { getLeftJoystickInput, orbitWithRightJoystick } from 'guis/elements/joysticks'
import { wasdInputState } from 'guis/elements/wasd-buttons'
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'

export const drivingRaftGroup = new Group()
drivingRaftGroup.add(new Mesh(
  new BoxGeometry(1, 1, 1),
  new MeshBasicMaterial({ color: 'red' })))

export const drivingRaftElement = {
  meshLoader: async () => {
    return drivingRaftGroup
  },
} satisfies GameElement

const upAxis = new Vector3(0, 1, 0)
const forward = new Vector3()
const right = new Vector3()
const moveVec = new Vector3()

const DRIVE_SPEED = 0.006 // speed of raft
const raftVel = new Vector3()
let raftAngle = 0

export function updateRaftDrive(context: GameUpdateContext) {
  const { seaBlock, dt } = context
  const { camera, orbitControls } = seaBlock

  // 1. Calculate camera-to-anchor direction in xz-plane (projected forward)
  forward.set(
    camera.position.x - orbitControls.target.x,
    0,
    camera.position.z - orbitControls.target.z,
  )
  if (forward.lengthSq() > 0) forward.normalize()
  else forward.set(0, 0, 1) // fallback

  // 2. Compute right vector in xz-plane (perpendicular to forward)
  // Cross product with up (0,1,0) for rightward direction
  right.crossVectors(forward, upAxis)

  // 3. Build movement vector from input
  const isUpHeld = wasdInputState['upBtn']
  const isDownHeld = wasdInputState['downBtn']
  const isLeftHeld = wasdInputState['leftBtn']
  const isRightHeld = wasdInputState['rightBtn']

  // if (
  //   mouseState && !mouseState.isTouch // desktop mouse on screen
  //   && !this.flatUi.hoveredButton // no buttons hovered
  //   && Object.values(inputState).every(val => val === false) // no inputs held
  // ) {
  //   // allow scrolling with mouse at edge of screen
  //   const margin = 2 // thickness of edge region in big pixels
  //   const { x, y } = mouseState.lvPos
  //   const { w, h } = seaBlock.layeredViewport
  //   if (y < margin) isUpHeld = true
  //   if (y > h - margin) isDownHeld = true
  //   if (x < margin) isLeftHeld = true
  //   if (x > w - margin) isRightHeld = true
  // }

  // WASD input
  moveVec.set(0, 0, 0)
  if (isUpHeld) moveVec.sub(forward)
  if (isDownHeld) moveVec.add(forward)
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
    moveVec.addScaledVector(forward, y)
  }
  orbitWithRightJoystick(seaBlock, dt) // gui/elements/joysticks.ts
  seaBlock.orbitControls.update()

  if (moveVec.x !== 0 || moveVec.z !== 0) {
    raftVel.set(moveVec.x, 0, moveVec.z).normalize().multiplyScalar(DRIVE_SPEED * dt)
    raftAngle = Math.atan2(moveVec.x, moveVec.z) + Math.PI // set forward to match chess camera
  }
  else {
    raftVel.set(0, 0, 0)
  }
  drivingRaftGroup.position.add(raftVel)
  drivingRaftGroup.setRotationFromAxisAngle(upAxis, raftAngle)
}
