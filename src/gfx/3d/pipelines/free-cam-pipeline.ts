/**
 * @file free-cam-pipeline.ts
 *
 * Pipeline for terrain and water in freecam game.
 * 1. Check if inside visible radius (or recently exited).
 * 2. Apply generated terrain values.
 * 3. Apply water physics animation offset.
 * 4. Apply enter/exit animation offset.
 */

import { gfxConfig } from 'configs/imp/gfx-config'
import type { Pipeline } from './pipeline'
import { setOriginalTileColors } from '../tile-group-color-buffer'

// (ms) duration of tile entrance and exit animation
const ENTR_DURATION = 300
const EXIT_DURATION = 300
let maxD2 = 10
let cutoff = 10
const amplitude: number = 20

// keys are tile indices, values are (ms) times
const entranceStartTimes: Record<number, number> = {}
const exitStartTimes: Record<number, number> = {}

export const freeCamPipeline = {

  update: (_dt) => {
    // visible radius-squared
    maxD2 = Math.pow(gfxConfig.flatConfig.visibleRadius, 2)

    // distance to truncate from bottom of tile
    cutoff = -gfxConfig.flatConfig.extendBottom / amplitude
  },

  steps: [

    // 1. check if in radius (or recently passed outside), if not cancel pipeline
    ({ group, tileIndex, current }) => {
      const { i } = tileIndex

      // check distance to center
      const box = group.tilePositions[i]
      const dx = box.x - group.centerXZ.x
      const dz = box.z - group.centerXZ.z
      const dSquared = dx * dx + dz * dz

      if (dSquared < maxD2) {
        // inside visible radius
        if (!entranceStartTimes[i]) {
          // just entered
          entranceStartTimes[i] = performance.now()
          exitStartTimes[i] = 0
        }
        return current // continue pipeline
      }
      else {
        // outside visible radius
        if (!exitStartTimes[i]) {
          // just exited
          exitStartTimes[i] = performance.now()
          entranceStartTimes[i] = 0
          return current // continue pipeline
        }

        const delta = performance.now() - exitStartTimes[i]
        if (delta < EXIT_DURATION) {
          // recently exited, still in exit animation
          return current // continue pipeline
        }
      }

      return null // cancel pipeline and do not render tile
    },

    // 2. apply generated terrain values
    ({ group, tileIndex, style, current }) => {
      const { x, z, i } = tileIndex
      let rTile = group.generatedTiles[i]

      // compute new colors if necessary
      if (!rTile) {
        rTile = group.generateTile(tileIndex)
        const { gTile } = rTile

        // compute styled colors only on first render
        // rTile.originalColors = style.getTileColors({
        const originalColors = style.getTileColors({
          x, z, generatedTile: gTile,

          // support @land and @sea conditions in styles
          land: !gTile.isWater, sea: gTile.isWater,
        })

        setOriginalTileColors(tileIndex, originalColors, true)
      }

      // current.colors = rTile.liveColors as TileColors
      current.isWater = rTile.gTile.isWater
      return current
    },

    // 3. Apply water physics animation offset.
    ({ group, tileIndex, current }) => {
      const { i } = tileIndex
      const rTile = group.generatedTiles[i]
      if (!rTile) return null
      const { gTile } = rTile

      if (gTile.isWater) {
        // group.sim.resetTile(i)
        current.height = getAnimatedRenderHeight(
          gTile.height,
          group.sim.getWavePos(i),
        )
      }
      else {
        current.height = getAnimatedRenderHeight(
          gTile.height,
          0,
        )
      }

      return current
    },

    // 4. Apply animation offset for entrance/exit at visible radius
    ({ current, tileIndex }) => {
      let anim = 1
      const { i } = tileIndex
      const entranceStartTime = entranceStartTimes[i]
      const exitStartTime = exitStartTimes[i]
      if (exitStartTime) {
        const elapsed = EXIT_DURATION - (performance.now() - exitStartTime)
        anim = _dampedAnim(elapsed, EXIT_DURATION)
      }
      else if (entranceStartTime) {
        const elapsed = performance.now() - entranceStartTime
        anim = _dampedAnim(elapsed, ENTR_DURATION)
      }
      const entranceOffset = -Math.min(current.height - cutoff, anim)

      current.height += entranceOffset
      return current
    },

  ],
} as const satisfies Pipeline

function _dampedAnim(time: number, duration: number): number {
  if (time > duration) {
    return 0
  }
  const t = Math.min(time / duration, 1) // Normalize to [0,1]
  const progress = 1 - Math.pow(1 - t, 4)
  const axisVal = (1 - progress)
  return axisVal
}

function getAnimatedRenderHeight(tileHeight: number, wavePos: number) {
  return tileHeight * amplitude / 255 + 1 + wavePos
}
