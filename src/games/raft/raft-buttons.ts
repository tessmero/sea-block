/**
 * @file raft-buttons.ts
 *
 * Keep track of pressed/unpressed state for buttons
 * on the surface of the raft.
 */

import type { InstancedBufferAttribute } from 'three'
import { Color, type Vector3 } from 'three'
import type { AutoThruster } from './raft-auto-thrusters'
import { raft } from './raft'
import { instancedPieceMeshes } from './raft-gfx-helper'

export type RaftButton = {
  dx: number // position relative to center of raft surface
  dz: number
  index: number // mesh instance index
  triggers: Array<AutoThruster> // thrusters to fire when pressed
  isPressed: boolean
}

export function resetRaftButtons() {
  for (const raftButton of raft.buttons) {
    raftButton.isPressed = false
    updateButton(raftButton)
  }
}

export function updateRaftButtons(wcPos: Vector3) {
  for (const raftButton of raft.buttons) {
    const { dx, dz } = raftButton
    raftButton.isPressed = (Math.abs(wcPos.x - dx) < 0.6 && Math.abs(wcPos.z - dz) < 0.6)
    updateButton(raftButton)
  }
}

function updateButton(raftButton: RaftButton) {
  const im = instancedPieceMeshes.button
  const color = raftButton.isPressed ? pressedColor : unpressedColor
  im.setColorAt(raftButton.index, color)
  updateTriggers(raftButton);
  (im.instanceColor as InstancedBufferAttribute).needsUpdate = true
}

function updateTriggers(raftButton: RaftButton) {
  const im = instancedPieceMeshes.thruster
  for (const thruster of raftButton.triggers) {
    thruster.isFiring = raftButton.isPressed
    const color = raftButton.isPressed ? pressedColor : unpressedColor
    im.setColorAt(thruster.index, color)
  }
  (im.instanceColor as InstancedBufferAttribute).needsUpdate = true
}

const pressedColor = new Color('white')
const unpressedColor = new Color('black')
