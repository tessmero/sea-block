/**
 * @file raft-drive-helper.ts
 *
 * Helper for raft-drive game.
 */
import type { GameElement, GameUpdateContext } from 'games/game'
import { getLeftJoystickInput, orbitWithRightJoystick } from 'guis/elements/joysticks'
import { wasdInputState } from 'guis/elements/wasd-buttons'
import type { SeaBlock } from 'sea-block'
import type { Camera } from 'three'
import { PerspectiveCamera, Vector3 } from 'three'
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Vector2 } from 'three'
import type { RaftRig } from './raft-physics'
import { buildRaftRig } from './raft-physics'
import { WalkingCube } from 'games/walking-cube/walking-cube'
import { lerp } from 'three/src/math/MathUtils.js'
import type { ElementEvent } from 'guis/gui'
import { raft } from './raft'
import { interpCamera } from 'gfx/3d/lerp-camera'
import { FREECAM_DESKTOP_LAYOUT } from 'guis/layouts/freecam-desktop-layout'
import { FREECAM_LANDSCAPE_LAYOUT } from 'guis/layouts/freecam-landscape-layout'
import { RAFT_DRIVE_FOCUS_DESKTOP_LAYOUT } from 'guis/layouts/raft-drive-focus-desktop-layout'
import { RAFT_DRIVE_FOCUS_TOUCH_LAYOUT } from 'guis/layouts/raft-drive-focus-touch-layout'

const wc = new WalkingCube(1)
wc.isControlledByPlayer = false

export const drivingRaftGroup = new Group()
drivingRaftGroup.add(new Mesh(
  new BoxGeometry(1, 1, 1),
  new MeshBasicMaterial({ color: 'red' })))
export const drivingRaftElement = {
  // isPickable: true,
  // clickAction: () => { console.log('clicked driving raft') },
  meshLoader: async () => {
    for (const name of (['leftFoot', 'rightFoot', 'torso'])) {
      wc[name].mesh = await wc[name].meshLoader()
      drivingRaftGroup.add(wc[name].mesh)
    }
    return drivingRaftGroup
  },
} satisfies GameElement

const forward = new Vector2(0, 1)
const right = new Vector2(1, 0)
const moveVec = new Vector2(0, 0)

export let raftRig: RaftRig // physics object made of spheres

let driveCamFocus = 0 // 0 = same as orbit cam, 1 = locked to raft
export let targetFocus = 0 // 0 or 1
const focusSpeed = 1e-3 // lerp to target per ms

const raftCam: PerspectiveCamera = new PerspectiveCamera()
const defaultOffset = new Vector3() // camera at zero focus, set to regular player-controlled camera
const focusOffset = new Vector3(10, 10, 10) // camera relative to raft at full focus

export function raftDriveLayoutFactory() {
  const isTouchDevice = true
  if (targetFocus === 0) {
    return isTouchDevice ? FREECAM_LANDSCAPE_LAYOUT : FREECAM_DESKTOP_LAYOUT
  }
  return isTouchDevice ? RAFT_DRIVE_FOCUS_TOUCH_LAYOUT : RAFT_DRIVE_FOCUS_DESKTOP_LAYOUT
}

export function resetRaftDrive(context: SeaBlock) {
  wc.reset()

  raft.moveMeshesTo(drivingRaftGroup)
  raftRig = buildRaftRig(context)
  raftCam.copy(context.camera)
}

function updateRaftCam({ seaBlock, dt }: GameUpdateContext) {
  // advance driveCamFocus towards target focus
  if (targetFocus === 1 && driveCamFocus !== 1) {
    driveCamFocus = Math.min(1, driveCamFocus + dt * focusSpeed)
    if (driveCamFocus === 1) {
      // just focused
      seaBlock.game.gui.refreshLayout(seaBlock)
      seaBlock.layeredViewport.handleResize(seaBlock)
    }
  }
  else if (targetFocus === 0 && driveCamFocus !== 0) {
    driveCamFocus = Math.max(0, driveCamFocus - dt * focusSpeed)
    if (driveCamFocus === 0) {
      // just unfocused
      seaBlock.game.gui.refreshLayout(seaBlock)
      seaBlock.layeredViewport.handleResize(seaBlock)
    }
  }
}

export function getRaftDriveCameraOverride(seaBlock: SeaBlock): Camera | null {
  if (driveCamFocus === 0) return null

  // set focusOffset based on drivingRaftGroup orientation
  const localOffset = focusOffset.clone()
  drivingRaftGroup.updateMatrixWorld(true)
  const worldPosition = localOffset.applyMatrix4(drivingRaftGroup.matrixWorld)

  const { camera, orbitControls } = seaBlock
  const { target } = orbitControls
  defaultOffset.copy(camera.position).sub(target)
  interpCamera(raftCam,
    target, target,
    defaultOffset, worldPosition.sub(target), // focusOffset,
    driveCamFocus,
  )

  // check if resized
  if (raftCam.aspect !== camera.aspect) {
    raftCam.aspect = camera.aspect
    raftCam.fov = camera.fov
    raftCam.updateProjectionMatrix()
  }

  return raftCam
}

export function clickRaftMesh(event: ElementEvent) {
  // console.log('click raft ')
  // if (targetFocus === 0) {
  //   targetFocus = 1
  //   return
  // }
  targetFocus = 1 - targetFocus

  const { inputEvent } = event
  if (inputEvent) {
    const pickedPiece = raft.getPickedPieceMesh(inputEvent)
    if (pickedPiece) {
      // console.log('picked piece', JSON.stringify(pickedPiece))
    }
  }
}

export function updateRaftDrive(context: GameUpdateContext) {
  updateRaftCam(context)
  const { dt } = context

  raft.moveMeshesTo(drivingRaftGroup)
  driveCamFocus = lerp(driveCamFocus, targetFocus, focusSpeed * dt)// update cam focus

  wc.update(context) // update walking cube character on raft

  raftRig.update(dt)
  raftRig.alignMesh(drivingRaftGroup)

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
  orbitWithRightJoystick(context) // gui/elements/joysticks.ts

  if (moveVec.y > 0) {
    raftRig.applyForwardThrust(moveVec.y * 4e-4)
  }
  raftRig.applyTorque(moveVec.x * 4e-4)
}
