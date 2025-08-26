/**
 * @file raft-drive-helper.ts
 *
 * Helper for raft-drive game.
 */
import type { GameElement, GameUpdateContext } from 'games/game'
import { getLeftJoystickInput, orbitWithRightJoystick } from 'guis/elements/joysticks'
import { wasdInputState } from 'guis/elements/wasd-buttons'
import type { SeaBlock } from 'sea-block'
import { Matrix4 } from 'three'
import { Group, Vector2 } from 'three'
import type { RaftRig } from './raft-physics'
import { buildRaftRig } from './raft-physics'
import { WalkingCube } from 'games/walking-cube/walking-cube'
import type { ElementEvent } from 'guis/gui'
import { raft, resetRaftBuild } from './raft'
import { RAFT_LANDSCAPE_LAYOUT } from 'guis/layouts/raft/raft-landscape-layout'
import { fireAutoThrusters } from './raft-auto-thrusters'
import { instancedPieceElements, instancedPieceMeshes } from './gfx/raft-gfx-helper'
import { resetRaftButtons, updateRaftButtons } from './raft-buttons'
import { RAFT_DESKTOP_LAYOUT } from 'guis/layouts/raft/raft-desktop-layout'
import { hoverCursorMesh } from './gfx/raft-hovered-tile-highlight'
import { clickablesMesh } from './gfx/raft-clickable-highlight'
import { wiresMesh } from './gfx/raft-wires-overlay'
import { selectedCursorMesh } from './gfx/raft-clicked-tile-highlight'

const wc = new WalkingCube(1)
wc.controlMode = 'raft'

// all raft-locked meshes
export const drivingRaftGroup = new Group()
export const drivingRaftElement = {
  // isPickable: true,
  // clickAction: () => { console.log('clicked driving raft') },
  meshLoader: async () => {
    // raft parts
    for (const elem of instancedPieceElements) {
      drivingRaftGroup.add(await elem.meshLoader())
    }

    // walking cube character on raft
    for (const name of (['leftFoot', 'rightFoot', 'torso'])) {
      wc[name].mesh = await wc[name].meshLoader()
      drivingRaftGroup.add(wc[name].mesh)
    }

    // cursors to highlight 0-2 tiles
    drivingRaftGroup.add(hoverCursorMesh) // hovered tile
    drivingRaftGroup.add(selectedCursorMesh) // selected tile

    // overlays for building/wiring phases
    drivingRaftGroup.add(clickablesMesh)
    drivingRaftGroup.add(wiresMesh)

    return drivingRaftGroup
  },
} satisfies GameElement

const forward = new Vector2(0, 1)
const right = new Vector2(1, 0)
const moveVec = new Vector2(0, 0)

export let raftRig: RaftRig // physics object made of spheres

export function raftLayoutFactory() {
  const isTouchDevice = true
  return isTouchDevice ? RAFT_LANDSCAPE_LAYOUT : RAFT_DESKTOP_LAYOUT
}

export function resetRaftDrive(context: SeaBlock) {
  if (!raft) {
    resetRaftBuild(context)
  }
  raft.hlTiles.clear()

  wc.reset()
  resetRaftButtons()

  // raft.moveMeshesTo(drivingRaftGroup)
  raftRig = buildRaftRig(context)
}

export function clickDistantRaftMesh(_event: ElementEvent) {
  // console.log(' clickDistantRaftMesh ')
}

export function updateRaftDrive(context: GameUpdateContext) {
  const { dt } = context

  wc.update(context) // update walking cube character on raft

  raftRig.update(dt)
  raftRig.alignMesh(drivingRaftGroup, dt)

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
    moveVec.addScaledVector(right, -2 * x)
    moveVec.addScaledVector(forward, -2 * y)
  }
  orbitWithRightJoystick(context) // gui/elements/joysticks.ts

  // update buttons on surface of raft based on walking-cube torso position
  updateRaftButtons(wc.torsoPos)

  // apply thrust to physics rig
  fireAutoThrusters(
    raft.thrusters, // available thrusters, some are firing
    raftRig, // apply net force here
  )

  // animate thrusters
  spinFiringThrusters(dt)
}

function spinFiringThrusters(dt: number) {
  spin.makeRotationY(2e-3 * dt)
  const thrusterIm = instancedPieceMeshes.thruster
  for (const [i, thruster] of raft.thrusters.entries()) {
    if (thruster.isFiring) {
      thrusterIm.getMatrixAt(i, m4)
      m4.multiply(spin)
      thrusterIm.setMatrixAt(i, m4)
    }
  }
  thrusterIm.instanceMatrix.needsUpdate = true
}

const spin = new Matrix4()
const m4 = new Matrix4()
