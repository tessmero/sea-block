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
import { instancedPieceMeshes } from './gfx/raft-gfx-helper'
import { playSound } from 'audio/sound-effects'

const pressedColor = new Color('#ffffff')
const unpressedColor = new Color('#7eb5e8')

const thrusterFiringColor = new Color('#c4d4fa')
const thrusterOffColor = new Color('#868686')

export type RaftButton = {
  dx: number // position relative to center of raft surface
  dz: number
  imIndex: number // mesh instance index
  pieceIndex: number // index in raftPieces
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
  for (const thruster of raft.thrusters) {
    thruster.isFiring = false
  }
  for (const raftButton of raft.buttons) {
    const { dx, dz } = raftButton
    const wasPressed = raftButton.isPressed
    raftButton.isPressed = (Math.abs(wcPos.x - dx) < 0.6 && Math.abs(wcPos.z - dz) < 0.6)
    updateButton(raftButton)

    if (wasPressed !== raftButton.isPressed) {
      // button just changed state
      playSound('chessClick')
    }
  }
  _updateThrusterColors()
}

function updateButton(raftButton: RaftButton) {
  const im = instancedPieceMeshes.button
  const color = raftButton.isPressed ? pressedColor : unpressedColor
  im.setColorAt(raftButton.imIndex, color);
  (im.instanceColor as InstancedBufferAttribute).needsUpdate = true
  _updateTriggers(raftButton)
}

function _updateTriggers(raftButton: RaftButton) {
  if (raftButton.isPressed) {
    for (const thruster of raftButton.triggers) {
      thruster.isFiring = true
    }
  }
}

function _updateThrusterColors() {
  const im = instancedPieceMeshes.thruster
  for (const thruster of raft.thrusters) {
    const color = thruster.isFiring ? thrusterFiringColor : thrusterOffColor
    im.setColorAt(thruster.imIndex, color)
  }
  (im.instanceColor as InstancedBufferAttribute).needsUpdate = true
}
