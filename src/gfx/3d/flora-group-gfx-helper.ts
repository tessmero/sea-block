/**
 * @file flora-group-gfx-helper.ts
 *
 * Used in flora-group.ts to render grass/tree/flower meshes.
 */

import { Object3D, Vector3 } from 'three'
import type { FloraGroup } from '../../core/groups/flora-group'
import type { TileIndex } from '../../core/grid-logic/indexed-grid'
import type { SeaBlock } from '../../sea-block'
import { floraConfig } from '../../configs/flora-config'

export class FloraGroupGfxHelper {
  constructor(private readonly group: FloraGroup) {}

  updateFloraMeshes(seaBlock: SeaBlock) {
    const { group } = this

    // reset index of mesh instances for rendering
    for (const subgroup of group.subgroups) {
      subgroup.resetCount()
    }

    const { liveRenderHeights } = group.terrain.gfxHelper

    // compute direction for to face camera from center tile
    lookOffset.subVectors(seaBlock.camera.position, seaBlock.orbitControls.target)

    for (const tileIndex of group.grid.tileIndices) {
      const tile = group.members[tileIndex.i]
      const height = liveRenderHeights[tileIndex.i]
      if (tile.isFlora && !Number.isNaN(height)) {
        // group member should be rendered
        // always re-apply mesh instance colors
        if (!this._updateRenderInstance(tileIndex, height)) {
          // break // reached count limit
        }
      }
      else {
        // group member will not be rendered
      }
    }

    // update mesh count based on what will actually be rendered
    // (should boost performance)
    for (const subgroup of group.subgroups) {
      subgroup.finalizeCount()
    }
  }

  private _updateRenderInstance(tileIndex: TileIndex, height: number): boolean {
    const {
      FLORA_AMPLITUDE, FLORA_LIMIT,
    } = floraConfig.flatConfig

    const { group } = this
    const { i: memberIndex } = tileIndex
    const subgroup = group.subgroups[0]

    if (subgroup.reachedCountLimit()) {
      // reached count limit (subgroup.ts)
      return false// do nothing, not successful
    }

    const box = group.terrain.tilePositions[memberIndex]
    // const tile = group.terrain.members[memberIndex]

    let waveX = FLORA_AMPLITUDE * this.group.sim.pos[memberIndex * 2]
    let waveZ = FLORA_AMPLITUDE * this.group.sim.pos[memberIndex * 2 + 1]
    const d2 = waveX * waveX + waveZ * waveZ
    const ratio = d2 / FLORA_LIMIT
    if (ratio > 1) {
      waveX /= ratio
      waveZ /= ratio
    }

    dummy.position.set(
      box.x + waveX,
      height + 0.25,
      box.z + waveZ,
    )
    // // face cam but stay upright
    // const cam = seaBlock.camera.position
    // dummyLookat.set(cam.x, height, cam.z)
    // dummy.lookAt(dummyLookat)

    // // face straight to cam
    // dummy.lookAt(cam)

    // all face same direction
    dummy.lookAt(box.x + lookOffset.x, height + lookOffset.y, box.z + lookOffset.z)

    dummy.updateMatrix()
    const newIndexInSubgroup = subgroup.setMemberMatrix(memberIndex, dummy.matrix)
    group.subgroupsByFlatIndex[memberIndex] = [subgroup, newIndexInSubgroup]
    // if (colors) {
    //   const tileMesh = subgroup.mesh as TileMesh
    //   tileMesh.setColorsForInstance(newIndexInSubgroup, colors)
    // }
    return true // yes successful
  }
}

function _limitAbs(limit, value) {
  if (value < -limit) {
    return -limit
  }
  if (value > limit) {
    return limit
  }
  return value
}

const dummy = new Object3D()
dummy.scale.set(1, 1, 1)

// const dummyLookat = new Vector3()

const lookOffset = new Vector3()
