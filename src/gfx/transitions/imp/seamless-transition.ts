/**
 * @file seamless-transition.ts
 *
 * Transition used to smoothly switch to new generator/game without covering screen.
 */

import type { SeaBlock } from 'sea-block'
import { Transition } from '../transition'
import { Vector3 } from 'three'
import { lerpCameraSpherical } from 'gfx/3d/lerp-camera'
import type { Step } from 'gfx/3d/pipelines/pipeline'

const cameraLerpSpeed = 4e2

export class SeamlessTransition extends Transition {
  static { Transition.register('seamless', () => new SeamlessTransition()) }

  public totalDuration = 800

  // game/terrain changes should be applied when starting this transition
  public doesAllowMidTransitionReset = false // not halfway through

  static desiredCameraOffset = new Vector3(10, 10, 10)

  private static snapshot: Record<number, number> = {}

  // set start point for terrain lerp
  static snapshotTerrain(seaBlock: SeaBlock) {
    const snapshot = {}
    const { terrain } = seaBlock
    const { grid, gfxHelper } = terrain
    for (const tile of grid.tileIndices) {
      snapshot[tile.i] = gfxHelper.getLiveHeight(tile)
    }
    SeamlessTransition.snapshot = snapshot
  }

  // lerp between snapshot and new terrain
  public getExtraPipelineStep(): Step {
    return ({ current, tileIndex }) => {
      const startHeight = SeamlessTransition.snapshot[tileIndex.i] || current.height
      const alpha = Math.min(1, this.fractionDone + 0.5)

      // // debug
      // const delta = Math.abs(startHeight - current.height)
      // if (delta > 10) {
      //   console.log('seamless lerp terrain big delta')
      // }

      current.height = avg(startHeight, current.height, alpha)

      // // debug
      // if (current.height > 20) {
      //   console.log('seamless lerp terrain big height')
      // }

      return current
    }
  }

  private fractionDone = 0

  private context!: SeaBlock

  protected reset(context: SeaBlock): void {
    this.context = context
    this.fractionDone = 0
    // do nothing
  }

  // override default black-screen after hide
  public cleanupHide(): void {
    this.cleanupShow() // clear front layer (do nothing)
  }

  private lerpCamera(dt: number) {
    const { camera, orbitControls } = this.context
    const { target } = orbitControls
    lerpCameraSpherical(camera, target,
      SeamlessTransition.desiredCameraOffset, dt * cameraLerpSpeed)
  }

  public _hide(t0: number, t1: number): void {
    this.lerpCamera(t1 - t0)
    this.fractionDone = t1 / 2
    // scaleSongVolume(t1)
  }

  public _show(t0: number, t1: number): void {
    this.lerpCamera(t1 - t0)
    this.fractionDone = t1 / 2 + 0.5
  }
}

function avg(start: number, end: number, fraction: number): number {
  return start * (1 - fraction) + end * fraction
}
