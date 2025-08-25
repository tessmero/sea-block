/**
 * @file raft-auto-thrusters.ts
 *
 * Help decide which thrusters should be turned on and the resulting net force.
 */

import type { Vector2 } from 'three'
import type { RaftRig } from './raft-physics'
import type { RenderablePiece } from './raft-gfx-helper'

export type AutoThruster = {
  readonly dx: number
  readonly dz: number
  readonly direction: Direction
  isFiring: boolean
}

type Direction = 'up' | 'down' | 'left' | 'right'

// Check adjacent tiles and return the direction based on first occupied one
export function getThrusterDirection(piece: RenderablePiece): Direction {
  const { raft, tile } = piece
  for (const { x, z } of raft.grid.tiling.getAdjacent(tile.x, tile.z)) {
    const adjTile = raft.grid.xzToIndex(tile.x + x, tile.z + z)
    if (!adjTile) continue
    const adjPiece = raft.getPieceOnTile(adjTile)
    if (!adjPiece) continue
    if (adjPiece.type === 'floor') {
      if (x === -1) return 'up'
      if (x === 1) return 'down'
      if (z === -1) return 'right'
      if (z === 1) return 'left'
    }
  }
  // Default direction if no adjacent pieces found
  return 'down'
}

// attempt to control raft using thrusters
export function fireAutoThrusters(
  thrusters: Array<AutoThruster>,
  strafe: Vector2, turn: number,
  raftRig: RaftRig,
) {
  // const turnSign = Math.sign(turn)

  // Compute net available thrust in each direction and torque
  let totalForward = 0
  let totalRight = 0
  let totalTorque = 0

  // Assume each thruster provides 1 unit of force in its direction
  for (const thruster of thrusters) {
    // const x = Math.sign(thruster.dx)
    // const z = Math.sign(thruster.dz)
    switch (thruster.direction) {
      case 'down':
        // thruster.isFiring = strafe.y > 0 || (z !== 0 && z === turnSign)
        if (thruster.isFiring) {
          totalForward += 1
          totalTorque += thruster.dz
        }
        break
      case 'up':
        // thruster.isFiring = strafe.y < 0 || (z !== 0 && z === -turnSign)
        if (thruster.isFiring) {
          totalForward -= 1
          totalTorque -= thruster.dz
        }
        break
      case 'right':
        // thruster.isFiring = strafe.x > 0 || (x !== 0 && x === turnSign)
        if (thruster.isFiring) {
          totalRight += 1
          totalTorque += thruster.dx
        }
        break
      case 'left':
        // thruster.isFiring = strafe.x < 0 || (x !== 0 && x === -turnSign)
        if (thruster.isFiring) {
          totalRight -= 1
          totalTorque -= thruster.dx
        }
        break
    }
  }

  // If no thrusters, do nothing
  if (thrusters.length === 0) return

  //   // Compute scaling factors to match desired strafe/turn
  //   // Clamp to [-1,1] so we never exceed what the thrusters can do
  //   const forwardScale = totalForward !== 0 ? Math.max(-1, Math.min(1, strafe.y / totalForward)) : 0;
  //   const rightScale = totalRight !== 0 ? Math.max(-1, Math.min(1, strafe.x / totalRight)) : 0;
  //   const torqueScale = totalTorque !== 0 ? Math.max(-1, Math.min(1, turn / totalTorque)) : 0;

  // console.log(strafe, totalForward)

  // Apply scaled thrusts
  raftRig.applyForwardThrust(totalForward * 1e-4)
  raftRig.applyRightThrust(totalRight * 1e-4)
  raftRig.applyTorque(totalTorque * 1e-5)
}
