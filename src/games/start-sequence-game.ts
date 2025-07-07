/**
 * @file start-sequence-game.ts
 *
 * Game implementation active during loading and title screens.
 *
 * Shifts settings gradually by hackilly adjusting flatConfig values directly.
 * Changes are lost on refreshing configurables.
 */

import { Vector3 } from 'three'
import { seaBlock } from '../main'
import { typedEntries } from '../typed-entries'
import type { MichaelTG } from '../generators/michael-tg'
import { gfxConfig } from '../configs/gfx-config'
import { FreeCamGame, freeCamGameConfig } from './free-cam-game'
import type { GameUpdateContext } from './game'

const target = new Vector3(1.95e9, 30, -1.618e9)
const distForFreeCam = 300 // distance to travel before switch to user-controlled accel
let traveled = 0 // distance

let didBuildControls = false

// parameters to adjust based on distance traveled
const allSegments: Record<string, Segment> = {

  'accel': {
    distances: [0, 20],
    multipliers: [0.3, 1],
    apply: (value) => {
      (seaBlock.game as StartSequenceGame).flatConfig.CAM_ACCEL = freeCamGameConfig.children.CAM_ACCEL.value * value
    },
    isFinished: false,
  },

  // saturation increases
  'saturation': {
    distances: [0, 180],
    multipliers: [0.3, 1],
    apply: (value) => {
      // checked in css-style
      StartSequenceGame.saturationMultiplier = value
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

  // // view becomes less pixelated in beginning
  // 'pixel-ratio': {
  //   distances: [10, 20],
  //   multipliers: [10, 1],
  //   apply: (value) => {
  //     seaBlock.renderer.setPixelRatio(1 / (seaBlock.flatConfig.pixelScale * value))
  //   },
  //   isFinished: false,
  // },

  // fraction of visible radius increases in beginning
  'visible-radius': {
    distances: [0, 180],
    multipliers: [0.15, 1],
    apply: (value) => {
      seaBlock.tileRenderer.flatConfig.visibleRadius = gfxConfig.children.visibleRadius.value * value
    },
    isFinished: false,
  },

  // transition from all-ocean to full terrain
  'peaks': {
    distances: [200, 280],
    multipliers: [0, 1],
    apply: (value) => {
      (seaBlock.generator as MichaelTG).flatConfig.peaks = seaBlock.flatConfig.peaks * value
    },
    isFinished: false,
  },

}

type Segment = {
  readonly distances: [number, number]
  readonly multipliers: [number, number]
  readonly apply: (number) => void
  isFinished: boolean // set to true when final value is parsed
}

export class StartSequenceGame extends FreeCamGame {
  public static saturationMultiplier = 0// '0%'

  private freeCamMode = false

  constructor() {
    super()

    // allow skipping start sequence with any key
    function handleEscapePress(event) {
      if (event.key === 'Escape') {
        traveled = distForFreeCam
        document.removeEventListener('keydown', handleEscapePress)
      }
    }
    document.addEventListener('keydown', handleEscapePress)
  }

  reset(context) {
    super.reset(context)

    traveled = 0
    for (const [_name, seg] of typedEntries(allSegments)) {
      seg.isFinished = false
    }

    const initial = getInitialParams()
    for (const param in initial) {
      allSegments[param].apply(initial[param])
    }
    // StartSequenceGame.saturationPct = `${initial.saturation * 100}%`
  }

  public update(context: GameUpdateContext): void {
    const changed = getChangedParams(traveled)

    for (const param in changed) {
      allSegments[param].apply(changed[param])
    }

    if (traveled >= distForFreeCam) {
      if (!didBuildControls) {
        didBuildControls = true
        seaBlock.rebuildControls()
      }
      super.update(context) // behave like free cam game
      // gridConfig.children.game.value = 'free-cam'
      seaBlock.config.children.game.value = 'free-cam'
      seaBlock.setGame('free-cam')
      seaBlock.onGameChange()
      return
    }

    // prepare to measure distance traveled this update
    const { x: oldX, z: oldZ } = this._lastAnchorPosition

    const { dt, mouseState } = context

    // pan grid if necessary
    this.centerOnAnchor(context)

    // accel wave maker towards center
    this.updateWaveMaker(dt, mouseState, false)

    // accel camera anchor towards fixed direction
    const { CAM_ACCEL } = this.flatConfig
    this.accelSphere(this.cameraAnchor, target, dt * CAM_ACCEL)

    // compute distance traveled this update
    const { x: newX, z: newZ } = this._lastAnchorPosition
    const traveledThisUpdate = Math.hypot(newX - oldX, newZ - oldZ)
    traveled += traveledThisUpdate
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
