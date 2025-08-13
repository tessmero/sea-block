/**
 * @file start-sequence-game.ts
 *
 * Shifts settings gradually by hackilly adjusting flatConfig values directly.
 * Changes are lost on refreshing configurables.
 */

import { Vector3 } from 'three'
import { gfxConfig } from 'configs/gfx-config'
import type { SeaBlock } from 'sea-block'
import { freeCamGameConfig } from 'configs/free-cam-game-config'
import { michaelConfig } from 'configs/michael-config'
import type { GameUpdateContext } from '../game'
import { Game } from '../game'
import { FreeCamGame } from './free-cam-game'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { Pipeline } from 'gfx/3d/pipelines/pipeline'
import { startSequencePipeline } from 'gfx/3d/pipelines/start-sequence-pipeline'

export class StartSequenceGame extends FreeCamGame {
  static {
    Game.register('start-sequence', {
      factory: () => new StartSequenceGame(),
      guiName: 'start-sequence',
    })
  }

  // public static isColorTransformEnabled = false
  public static colorTransformAnim = 0// '0%'

  public readonly distForFreeCam = 120 // distance to travel before switch to user-controlled accel
  public traveled = 0 // distance
  public static wasSkipped = false

  public getTerrainRenderPipeline(_tile: TileIndex): Pipeline {
    return startSequencePipeline
  }

  reset(context: SeaBlock) {
    super.reset(context)

    // StartSequenceGame.isColorTransformEnabled = true
    StartSequenceGame.wasSkipped = false

    this.traveled = 0
    for (const [_name, seg] of allSegments) {
      seg.isFinished = false
    }

    const initial = getInitialParams()
    for (const param in initial) {
      try {
        applyFunctions[param](initial[param], context)
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

    this.waveMaker.wmRadius = 0// stay in center

    const changed = getChangedParams(this.traveled)

    for (const param in changed) {
      const newVal = changed[param]
      if (typeof newVal === 'number') {
        applyFunctions[param](newVal, seaBlock)
      }
    }

    if (this.traveled >= this.distForFreeCam) {
      // if (!seaBlock.didBuildControls) {
      //   seaBlock.rebuildControls()
      // }
      // StartSequenceGame.isColorTransformEnabled = false

      // // working normal switch to free-cam
      seaBlock.setGame('free-cam')
      seaBlock.onGameChange()
      return
    }
    else {
      // start seuqnce is ongoing
      // set var checked in css-style to enable extra color transform
      // StartSequenceGame.isColorTransformEnabled = true
    }

    // prepare to measure distance traveled this update
    const { x: oldX, z: oldZ } = this._lastAnchorPosition

    // pan grid if necessary
    this.centerOnAnchor(seaBlock)

    // accel wave maker towards center
    // this.updateWaveMaker(dt, seaBlock.mouseState, false)
    this.waveMaker.updateWaveMaker(context)

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
  for (const [param, seg] of allSegments) {
    result[param] = seg.multipliers[0]
  }
  return result as Record<keyof typeof allSegments, number>
}

function getChangedParams(
  distance: number,
): Partial<Record<keyof typeof allSegments, number>> {
  const result = {}

  for (const [param, seg] of allSegments) {
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

type Segment = {
  readonly distances: [number, number]
  readonly multipliers: [number, number]
  isFinished: boolean // set to true when final value is parsed
}

// parameters to adjust based on distance traveled
const allSegments: Array<[string, Segment]> = [

  ['accel', {
    distances: [0, 40],
    multipliers: [0.3, 1],
    isFinished: false,
  }],
  ['visible-radius', {
    distances: [0, 80],
    multipliers: [0.1, 0.2],
    isFinished: false,
  }],
  ['visible-radius', {
    distances: [80, 90],
    multipliers: [0.2, 1],
    isFinished: false,
  }],
  ['peaks', {
    distances: [0, 100],
    multipliers: [0, 1],
    isFinished: false,
  }],

  // // saturation increases
  // 'saturation': {
  //   distances: [0, 180],
  //   multipliers: [0.3, 1],
  //   apply: (value) => {
  //     // checked in start-sequence-pipeline
  //     StartSequenceGame.colorTransformAnim = value
  //   },
  //   isFinished: false,
  // },

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

]

const applyFunctions: Record<string, (value: number, seaBlock: SeaBlock) => void> = {
  'accel': (value) => {
    freeCamGameConfig.flatConfig.CAM_ACCEL = freeCamGameConfig.tree.children.CAM_ACCEL.value * value
  },
  'visible-radius': (value) => {
    gfxConfig.flatConfig.visibleRadius = gfxConfig.tree.children.visibleRadius.value * value
  },
  'peaks': (value) => {
    michaelConfig.flatConfig.peaks = michaelConfig.tree.children.terrainCustomization.children.peaks.value * value
  },
}
