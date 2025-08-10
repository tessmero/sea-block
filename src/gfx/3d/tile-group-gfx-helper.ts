/**
 * @file tile-group-gfx-helper.ts
 *
 * Used by tile-group.ts to render land and sea tiles.
 *
 * Handles visible radius, tile enter/exit animations,
 * and styles.
 */

import { Object3D } from 'three'
import type { GeneratedTile } from '../../generators/terrain-generator'
import type { TileGroup } from '../../core/groups/tile-group'
import type { TileColors } from '../styles/style'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { TileMesh } from './tile-mesh'
import { freeCamPipeline } from './tile-render-pipeline/free-cam-pipeline'
import type { Pipeline, Step, TileValues } from './tile-render-pipeline/pipeline'
import { gfxConfig } from 'configs/gfx-config'
import { chessBoardPipeline } from './tile-render-pipeline/chess-board-pipeline'
import type { SeaBlock } from 'sea-block'
import type { StyleParser } from 'util/style-parser'

const dummy = new Object3D()

export interface RenderableTile {
  gTile: GeneratedTile // includes base color
  originalColors?: TileColors // computed colors, set on first render
  liveColors?: TileColors // potentially animated copy of original colors
  liveHeight?: number // precise y-value of top surface rendered in world
}

export class TileGroupGfxHelper {
  public readonly amplitude: number = 20

  constructor(private readonly group: TileGroup) {
  }

  updateTileMeshes(seaBlock: SeaBlock, dt: number) {
    const { group } = this
    const lerpAlpha = 0.005 * dt

    const pipelineFactory = seaBlock.game.getTerrainRenderPipeline
    const { style } = seaBlock

    freeCamPipeline.update(dt)
    chessBoardPipeline.update(dt)
    // const maxD2 = Math.pow(gfxConfig.flatConfig.visibleRadius, 2)

    // reset index of mesh instances for rendering
    for (const subgroup of group.subgroups) {
      subgroup.resetCount()
    }

    for (const tileIndex of group.grid.tileIndices) {
      const pipeline = pipelineFactory(tileIndex)
      const stepsToRun = this.getFullStepsToRun(pipeline, seaBlock)
      if (!this._updateRenderInstance(stepsToRun, style, tileIndex, lerpAlpha)) {
        // break // reached count limit
      }
    }

    // update mesh count based on what will actually be rendered
    // (should boost performance)
    for (const subgroup of group.subgroups) {
      subgroup.finalizeCount()
    }
  }

  private getFullStepsToRun(pipeline: Pipeline, seaBlock: SeaBlock) {
    const result = [...pipeline.steps]
    const extraStep = seaBlock.transition?.getExtraPipelineStep()
    if (extraStep) {
      result.push(extraStep)
    }
    return result
  }

  // public setColorsForTile(colors: TileColors, tile: TileIndex): void {
  //   let rTile = this.group.generatedTiles[tile.i]
  //   if (!rTile) {
  //     rTile = this.group.generateTile(tile)
  //   }

  //   rTile.originalColors = colors
  //   rTile.liveColors = deepCopy(colors)
  // }

  private _updateRenderInstance(
    stepsToRun: Array<Step>, style: StyleParser, tileIndex: TileIndex, lerpAlpha: number,
  ): boolean {
    const { group } = this
    const { x, z, i: memberIndex } = tileIndex

    if (typeof x === 'undefined') {
      throw new Error(`grid has no xz for memberIndex ${memberIndex}`)
    }
    const shapeIndex = group.grid.tiling.getShapeIndex(x, z)
    if (shapeIndex < 0 || shapeIndex >= group.subgroups.length) {
      throw new Error(`grid has invalide shapeIndex ${shapeIndex} at xz ${x}, ${z}`)
    }
    const subgroup = group.subgroups[shapeIndex]
    // const [subgroup, _oldIndexInSubgroup] = this.subgroupsByFlatIndex[memberIndex]

    if (subgroup.reachedCountLimit()) {
      // reached count limit (subgroup.ts)
      return false// do nothing, not successful
    }

    // debug
    if (group.subgroupsByFlatIndex[memberIndex][0] !== subgroup) {
      throw new Error('subgroup changed')
    }

    // run pipeline
    let current: TileValues = { height: 0, yOffset: 0 }
    for (const step of stepsToRun) {
      const result = step({ group: this.group, current, tileIndex, style })
      if (!result) {
        return true
      }
      current = result
    }

    // check pipeline result
    const rTile = group.generatedTiles[memberIndex]
    if (!rTile) {
      return true
    }
    const { originalColors, liveColors } = rTile

    const { height, yOffset } = current // result of pipeline
    group.members[memberIndex].height = height // height for sphere collision

    // compute tile animation (global drop-transition)

    const cutoff = -gfxConfig.flatConfig.extendBottom / this.amplitude
    const box = group.tilePositions[memberIndex]
    dummy.position.set(
      box.x,
      Math.max(cutoff, height / 2 + cutoff / 2) + yOffset,
      box.z,
    )
    dummy.scale.set(1, Math.max(0, height - cutoff), 1)

    rTile.liveHeight = dummy.position.y + dummy.scale.y / 2

    dummy.updateMatrix()
    const newIndexInSubgroup = subgroup.setMemberMatrix(memberIndex, dummy.matrix)
    group.subgroupsByFlatIndex[memberIndex] = [subgroup, newIndexInSubgroup]

    if (originalColors && liveColors) {
      const tileMesh = subgroup.mesh as TileMesh
      const targetColors = current.targetColors || originalColors
      liveColors.sides.lerp(targetColors.sides, lerpAlpha)
      liveColors.top.lerp(targetColors.top, lerpAlpha)
      tileMesh.setColorsForInstance(newIndexInSubgroup, liveColors)
    }
    return true // yes successful
  }

  getNewRenderHeight(tile: GeneratedTile, index: number): number {
    if (tile.isWater) {
      this.group.sim.resetTile(index)
      return this.getAnimatedRenderHeight(
        tile.height,
        this.group.sim.getWavePos(index),
      )
    }
    else {
      return this.getAnimatedRenderHeight(
        tile.height,
        0,
      )
    }
  }

  _dampedAnim(time: number, duration: number): number {
    if (time > duration) {
      return 0
    }
    const t = Math.min(time / duration, 1) // Normalize to [0,1]
    const progress = 1 - Math.pow(1 - t, 4)
    const axisVal = (1 - progress)
    return axisVal
  }

  getLiveHeight(tile: TileIndex): number | undefined {
    return this.group.generatedTiles[tile.i]?.liveHeight
  }

  getAnimatedRenderHeight(tileHeight: number, wavePos: number) {
    return tileHeight * this.amplitude / 255 + 1 + wavePos
  }
}

// function deepCopy(colors: TileColors): TileColors {
//   return {
//     top: colors.top.clone(),
//     sides: colors.sides.clone(),
//   }
// }
