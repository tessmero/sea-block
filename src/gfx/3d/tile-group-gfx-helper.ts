/**
 * @file tile-group-gfx-helper.ts
 *
 * Used by tile-group.ts to render land and sea tiles.
 *
 * Handles visible radius, tile enter/exit animations,
 * and styles.
 */

import { Object3D } from 'three'
import { gfxConfig } from '../../configs/gfx-config'
import type { GeneratedTile } from '../../generators/terrain-generator'
import type { StyleParser } from '../../util/style-parser'
import type { TileGroup } from '../../core/groups/tile-group'
import type { TileColors } from '../styles/style'
import type { TileIndex } from '../../core/grid-logic/indexed-grid'
import { GridAnimation } from '../grid-anims/grid-animation'
import { DropTransition } from './drop-transition'
import type { TileMesh } from './tile-mesh'

const dummy = new Object3D()

// (ms) duration of tile entrance and exit animation
const ENTR_DURATION = 300
const EXIT_DURATION = 300

export interface RenderableTile {
  gTile: GeneratedTile // includes base color
  entranceStartTime?: number // time when entered visible radius
  exitStartTime?: number // time when exited visible radius
  colors?: TileColors // computed colors, assigned on first render
}

export class TileGroupGfxHelper {
  public readonly amplitude: number = 20
  public readonly liveRenderHeights: Array<number> // used for flora gfx

  private readonly warpAnim: GridAnimation

  constructor(private readonly group: TileGroup) {
    this.liveRenderHeights = new Array(group.n).fill(NaN)

    this.warpAnim = GridAnimation.create('radial-height-warp', group.grid)
  }

  updateTileMeshes(style: StyleParser) {
    const { group } = this
    const maxD2 = Math.pow(gfxConfig.flatConfig.visibleRadius, 2)

    // reset index of mesh instances for rendering
    for (const subgroup of group.subgroups) {
      subgroup.resetCount()
    }

    for (const tileIndex of group.grid.tileIndices) {
      const { x, z, i: memberIndex } = tileIndex
      const box = group.tilePositions[memberIndex]
      const dx = box.x - group.centerXZ.x
      const dz = box.z - group.centerXZ.z
      const dSquared = dx * dx + dz * dz

      let rTile = group.generatedTiles[memberIndex]
      if (dSquared < maxD2) {
        // tile is inside visible radius
        group.members[memberIndex].isVisible = true

        if (rTile && !rTile.entranceStartTime) {
          // tile just entered radius
          rTile.entranceStartTime = Date.now()
          delete rTile.exitStartTime
        }
        if (!rTile) {
          rTile = group.generateTile(tileIndex)
        }

        // compute new colors if necessary
        if (!rTile.colors) {
          const { gTile } = rTile

          // compute styled colors only on first render
          rTile.colors = style.getTileColors({
            x, z, generatedTile: gTile,

            // support @land and @sea conditions in styles
            land: !gTile.isWater, sea: gTile.isWater,
          })
        }

        // have group member rendered
        // always re-apply mesh instance colors
        if (!this._updateRenderInstance(tileIndex, rTile)) {
          // break // reached count limit
        }
      }
      else {
        // tile is outside visible radius
        group.members[memberIndex].isVisible = false

        if (rTile?.colors) {
          // tile was generated and previously rendered

          if (!rTile.exitStartTime) {
            // tile just left visible radius
            rTile.entranceStartTime = undefined
            rTile.exitStartTime = Date.now()
          }

          const elapsed = Date.now() - rTile.exitStartTime
          if (elapsed < EXIT_DURATION) {
            // special case, tile recently left visible radius
            // render even though outside of visible radius
            if (!this._updateRenderInstance(tileIndex, rTile)) {
              // break // reached count limit (subgroup.ts)
            }
          }
          else {
            // tile out of radius an will not be rendered
            // rTile.exitStartTime = null
            // rTile.style = null
            this.liveRenderHeights[memberIndex] = NaN
          }
        }
      }
    }

    // update mesh count based on what will actually be rendered
    // (should boost performance)
    for (const subgroup of group.subgroups) {
      subgroup.finalizeCount()
    }
  }

  private _updateRenderInstance(tileIndex: TileIndex, rTile: RenderableTile): boolean {
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

    const { gTile, colors } = rTile

    const box = group.tilePositions[memberIndex]

    // distance to truncate from bottom of tile
    const cutoff = -gfxConfig.flatConfig.extendBottom / this.amplitude

    let renderHeight: number
    if (gTile.isWater) {
      renderHeight = this.getAnimatedRenderHeight(
        gTile.height,
        group.sim.getWavePos(memberIndex),
      )
    }
    else {
      renderHeight = this.getNewRenderHeight(gTile, memberIndex)
    }
    group.members[memberIndex].height = renderHeight // height for sphere collision

    // compute tile animation (enter/exit at visible radius)
    let anim = 1
    const { entranceStartTime, exitStartTime } = rTile
    if (exitStartTime) {
      const elapsed = EXIT_DURATION - (Date.now() - exitStartTime)
      anim = this._dampedAnim(elapsed, EXIT_DURATION)
    }
    else if (entranceStartTime) {
      const elapsed = Date.now() - entranceStartTime
      anim = this._dampedAnim(elapsed, ENTR_DURATION)
    }
    const entranceOffset = -Math.min(renderHeight - cutoff, anim)

    // compute tile animation (global drop-transition)
    let transitionOffset = 0
    if (DropTransition.gridAnim) {
      const tileAnim = DropTransition.gridAnim.getTileValue(tileIndex, DropTransition.t)
      transitionOffset = 500 * this._dampedAnim(1 - tileAnim, 1)
    }

    dummy.position.set(
      box.x,
      Math.max(cutoff, renderHeight / 2 + cutoff / 2 + entranceOffset) + transitionOffset,
      box.z,
    )
    dummy.scale.set(1, Math.max(0, renderHeight + entranceOffset - cutoff), 1)

    this.liveRenderHeights[memberIndex] = dummy.position.y + dummy.scale.y / 2

    dummy.updateMatrix()
    const newIndexInSubgroup = subgroup.setMemberMatrix(memberIndex, dummy.matrix)
    group.subgroupsByFlatIndex[memberIndex] = [subgroup, newIndexInSubgroup]
    if (colors) {
      const tileMesh = subgroup.mesh as TileMesh
      tileMesh.setColorsForInstance(newIndexInSubgroup, colors)
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

  getAnimatedRenderHeight(tileHeight: number, wavePos: number) {
    return tileHeight * this.amplitude / 255 + 1 + wavePos
  }
}
