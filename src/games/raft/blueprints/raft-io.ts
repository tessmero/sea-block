/**
 * @file raft-io.ts
 *
 * Read and write raft blueprints as json.
 */

import type { Button, RaftBlueprint } from './raft.json'
import { raft } from '../raft'

export function raftToJson(): RaftBlueprint {
  const result: RaftBlueprint = []
  const remainingButtons = [...raft.buttons]
  remainingButtons.reverse()
  for (const { type, tile } of raft.raftPieces) {
    if (type === 'cockpit') {
      continue // exclude cockpit from json
    }
    const x = tile.x - raft.centerTile.x
    const z = tile.z - raft.centerTile.z

    if (type === 'button') {
      const btn = remainingButtons.pop()
      if (!btn) {
        throw new Error('raft.buttons does not agree with raft.raftPieces')
      }
      const triggers = btn.triggers.map(thruster => thruster.pieceIndex)
      result.push({ type, x, z, triggers }) // button
    }
    else {
      result.push({ type, x, z }) // non-button piece
    }
  }

  return result
}

export function raftFromJson(blueprint: RaftBlueprint) {
  const { centerTile, grid } = raft

  // add pieces without wires
  for (const piece of blueprint) {
    const { type, x, z } = piece
    const tile = grid.xzToIndex(centerTile.x + x, centerTile.z + z)
    if (tile) {
      raft.buildPiece(type, tile, [])
    }
  }

  // add wires
  let buttonIndex = 0 // index in raft.buttons
  for (const piece of blueprint) {
    if (piece.type === 'button') {
      assignTriggersForButton(blueprint, piece, buttonIndex++)
    }
  }
}

function assignTriggersForButton(
  blueprint: RaftBlueprint, // blueprint
  bpButton: Button, // button in blueprint
  buttonIndex: number, // index of button in raft
) {
  for (const pieceIndex of bpButton.triggers) {
    if (blueprint[pieceIndex - 1].type !== 'thruster') { // blueprint skips first piece (cokcpit)
      throw new Error('button triggers non-thruster piece in blueprint')
    }
    if (raft.raftPieces[pieceIndex].type !== 'thruster') {
      throw new Error('button triggers non-thruster piece in raft')
    }
    const match = raft.thrusters.find(t => t.pieceIndex === pieceIndex)
    if (!match) {
      throw new Error('button trigger has no matching AutoThruster instance')
    }
    raft.buttons[buttonIndex].triggers.push(match)
  }
}
