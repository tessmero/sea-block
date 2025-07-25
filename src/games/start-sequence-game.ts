/**
 * @file start-sequence-game.ts
 *
 * Shifts settings gradually by hackilly adjusting flatConfig values directly.
 * Changes are lost on refreshing configurables.
 */

import { typedEntries } from 'util/typed-entries'
import { Vector3 } from 'three'
import { gfxConfig } from 'configs/gfx-config'
import type { SeaBlock } from 'sea-block'
import { freeCamGameConfig } from 'configs/free-cam-game-config'
import { michaelConfig } from 'configs/michael-config'
import { START_SEQUENCE_LAYOUT } from 'gui/layouts/start-sequence-layout'
import { skipBtn } from 'gui/elements/misc-buttons'
import { FreeCamGame } from './free-cam-game'
import type { GameUpdateContext } from './game'
import { Game } from './game'

export class StartSequenceGame extends FreeCamGame {
  static {
    Game.register('start-sequence', {
      factory: () => new StartSequenceGame(),
      elements: [
        skipBtn,
      ],
      layout: () => START_SEQUENCE_LAYOUT,
    })
  }

  public static isColorTransformEnabled = false
  public static colorTransformAnim = 0// '0%'

  public readonly distForFreeCam = 300 // distance to travel before switch to user-controlled accel
  public traveled = 0 // distance
  public static wasSkipped = false

  reset(context: SeaBlock) {
    super.reset(context)

    StartSequenceGame.isColorTransformEnabled = true
    StartSequenceGame.wasSkipped = false

    this.traveled = 0
    for (const [_name, seg] of typedEntries(allSegments)) {
      seg.isFinished = false
    }

    const initial = getInitialParams()
    for (const param in initial) {
      try {
        allSegments[param].apply(initial[param], context)
      }
      catch (_e) {
        // console.log(e)
      }
    }

    const { sphereGroup, camera, orbitControls } = context

    // hide all spheres
    for (let i = 0; i < sphereGroup.members.length; i++) {
      // sphereGroup.members[i].isGhost = true
      sphereGroup.members[i].isVisible = false
    }

    // reset camera
    const { x, z } = context.terrain.centerXZ
    const cam = this.getCamOffset(context)
    camera.position.set(x + cam.x, cam.y, z + cam.z)
    orbitControls.update()
  }

  public update(context: GameUpdateContext): void {
    const { seaBlock, dt } = context

    if (StartSequenceGame.wasSkipped && seaBlock.transition?.didFinishCover) {
      return
    }

    const changed = getChangedParams(this.traveled)

    for (const param in changed) {
      const newVal = changed[param]
      if (typeof newVal === 'number') {
        allSegments[param].apply(newVal, seaBlock)
      }
    }

    if (this.traveled >= this.distForFreeCam) {
      if (!seaBlock.didBuildControls) {
        seaBlock.rebuildControls()
      }
      // super.update(context) // behave like free cam game
      // gridConfig.children.game.value = 'free-cam'
      StartSequenceGame.isColorTransformEnabled = false
      seaBlock.setGame('free-cam')
      seaBlock.onGameChange()
      return
    }
    else {
      // start seuqnce is ongoing
      // set var checked in css-style to enable extra color transform
      StartSequenceGame.isColorTransformEnabled = true
    }

    // prepare to measure distance traveled this update
    const { x: oldX, z: oldZ } = this._lastAnchorPosition

    // pan grid if necessary
    this.centerOnAnchor(seaBlock)

    // accel wave maker towards center
    // this.updateWaveMaker(dt, seaBlock.mouseState, false)
    this.updateWaveMaker(dt)

    // accel camera anchor towards fixed direction
    const { CAM_ACCEL } = freeCamGameConfig.flatConfig
    this.accelSphere(this.cameraAnchor, target, dt * CAM_ACCEL)

    // compute distance traveled this update
    const { x: newX, z: newZ } = this._lastAnchorPosition
    const traveledThisUpdate = Math.hypot(newX - oldX, newZ - oldZ)
    this.traveled += traveledThisUpdate
  }
}

function getInitialParams(): Record<keyof typeof allSegments, number> {
  const result = {}
  for (const [param, seg] of typedEntries(allSegments)) {
    result[param] = seg.multipliers[0]
  }
  return result as Record<keyof typeof allSegments, number>
}

function getChangedParams(
  distance: number,
): Partial<Record<keyof typeof allSegments, number>> {
  const result = {}

  for (const [param, seg] of typedEntries(allSegments)) {
    if (seg.isFinished) {
      continue
    }
    let value: number

    if (distance <= seg.distances[0]) {
      continue
      // value = seg.values[0]
    }
    else if (distance >= seg.distances[1]) {
      value = seg.multipliers[1]
      seg.isFinished = true
    }
    else {
      // Linear interpolation
      const [d0, d1] = seg.distances
      const [v0, v1] = seg.multipliers
      const t = (distance - d0) / (d1 - d0)
      value = v0 + t * (v1 - v0)
    }

    result[param] = value
  }

  return result
}

const target = new Vector3(1.95e9, 30, -1.618e9)

// parameters to adjust based on distance traveled
const allSegments: Record<string, Segment> = {

  'accel': {
    distances: [0, 20],
    multipliers: [0.3, 1],
    apply: (value, _seaBlock) => {
      freeCamGameConfig.flatConfig.CAM_ACCEL = freeCamGameConfig.tree.children.CAM_ACCEL.value * value
    },
    isFinished: false,
  },

  // saturation increases
  'saturation': {
    distances: [0, 180],
    multipliers: [0.3, 1],
    apply: (value) => {
      // checked in css-style
      StartSequenceGame.colorTransformAnim = value
    },
    isFinished: false,
  },

  // // view zooms in beginning
  // 'fov': {
  //   distances: [10, 20],
  //   multipliers: [.1, 1],
  //   apply: (value) => {
  //     seaBlock.camera.fov = 60 * value
  //     seaBlock.camera.updateProjectionMatrix()
  //   },
  //   isFinished: false,
  // },

  // fraction of visible radius increases in beginning
  'visible-radius': {
    distances: [0, 180],
    multipliers: [0.15, 1],
    apply: (value) => {
      gfxConfig.flatConfig.visibleRadius = gfxConfig.tree.children.visibleRadius.value * value
    },
    isFinished: false,
  },

  // transition from all-ocean to full terrain
  'peaks': {
    distances: [200, 280],
    multipliers: [0, 1],
    apply: (value, _seaBlock) => {
      michaelConfig.flatConfig.peaks = michaelConfig.tree.children
        .terrainCustomization.children.peaks.value * value
    },
    isFinished: false,
  },

}

type Segment = {
  readonly distances: [number, number]
  readonly multipliers: [number, number]
  readonly apply: (value: number, seaBlock: SeaBlock) => void
  isFinished: boolean // set to true when final value is parsed
}
