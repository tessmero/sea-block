/**
 * @file chess-move-anim.ts
 *
 * Animation of a chess piece moving between two tiles.
 */

import { playSound } from 'audio/sound-effects'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { Vector3 } from 'three'

const duration = 300 // ms
const jumpHeight = 1

export class ChessMoveAnim {
  private t = 0

  public isFinished = false

  constructor(
    private readonly startPos: Vector3,
    private readonly endPos: Vector3,
    public readonly endTile: TileIndex,
  ) {
  }

  public update(dt: number): boolean {
    this.t += dt

    this.isFinished = this.t > duration

    if (this.isFinished) {
      playSound('chessLand')
    }

    return this.isFinished
  }

  public getLivePosition(): Vector3 {
    const { startPos, endPos } = this
    const fraction = Math.min(this.t / duration, 1)

    // Linear interpolation for X and Z
    positionDummy.lerpVectors(startPos, endPos, fraction)

    // Parabolic jump for Y
    const arc = 4 * fraction * (1 - fraction)
    positionDummy.y = startPos.y * (1 - fraction) + endPos.y * fraction + jumpHeight * arc

    return positionDummy
  }
}

const positionDummy = new Vector3()
