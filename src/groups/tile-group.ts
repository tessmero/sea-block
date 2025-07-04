/**
 * @file tile-group.ts
 *
 * Contains an array of Tile instances and their meshes.
 */
import * as THREE from 'three'
import { Vector3 } from 'three'
import { TiledGrid, TilePosition } from '../grid-logic/tiled-grid'
import { Group } from './group'
import { GeneratedTile } from '../generators/terrain-generator'
import { Tile } from '../tile'
import { TileSim } from '../physics/tile-sim'
import { extrude, TileMesh, TileMeshIm } from '../gfx/tile-mesh'
import { generator, style } from '../main'
import { gfxConfig } from '../configs/gfx-config'
import { TileStyle } from '../gfx/styles/style'
import { TileIndex } from '../grid-logic/indexed-grid'

// (ms) duration of tile entrance and exit animation
const ENTR_DURATION = 300
const EXIT_DURATION = 300

const dummy = new THREE.Object3D()
const dummyVec = new THREE.Vector3()

type RenderableTile = {
  gTile: GeneratedTile // includes base color
  entranceStartTime: number // time when entered visible radius
  exitStartTime?: number // time when exited visible radius
  style?: TileStyle // computed colors, assigned on first render
}

export class TileGroup extends Group<Tile, TileSim> {
  tilePositions: TilePosition[] = [] // grid tiling data
  generatedTiles: RenderableTile[] = [] // gfx data

  // current panning position
  private _offsetX: number = 0
  private _offsetZ: number = 0

  private readonly waterLevel: number

  public readonly amplitude: number = 20

  private readonly terrainXzScale: number = 1

  constructor(public grid: TiledGrid) {
    // count number of tiles per subgroup
    const subgroups = grid.tiling.shapes
      .map(shape => extrude(shape))
      .map(tileExt => ({
        n: 0,
        geometry: tileExt,
      }))
    const subgroupsByFlatIndex: { subgroupIndex: number, indexInSubgroup: number }[] = []

    for (const { x, z } of grid.tileIndices) {
      const sgIndex = grid.tiling.getShapeIndex(x, z)
      subgroupsByFlatIndex.push({
        subgroupIndex: sgIndex,
        indexInSubgroup: subgroups[sgIndex].n,
      })
      subgroups[sgIndex].n++
    }

    super({
      sim: new TileSim(grid),
      subgroups,
      subgroupsByFlatIndex,
    })

    this.waterLevel = 132
  }

  private buildTileMember(idx: TileIndex): Tile {
    const { i, x, z } = idx
    const deltas = normalNeighborOffsets
    const neighbors: number[] = []
    const { width, depth } = this.grid
    for (const { 'x': dx, 'z': dz } of deltas) {
      // get wrapped neighbor coords
      const ox = (x + dx + width) % width
      const oz = (z + dz + depth) % depth
      const neighbor = this.grid.xzToIndex(ox, oz).i
      neighbors.push(neighbor)
    }

    const gTile = this.generatedTiles[i].gTile
    const tile = new TileIm(this, i, neighbors, gTile.isWater)
    // tile.y = 2 * this.generatedTiles[idx].height

    return tile
  }

  private generateTile(x, z, index): RenderableTile {
    const result = {
      gTile: generator.getTile(x, z),
      entranceStartTime: Date.now(),
    }
    this.generatedTiles[index] = result

    // update water if called after members constructed
    if (index < this.members.length) {
      this.members[index].isWater = result.gTile.isWater
    }

    return result
  }

  build() {
    super.build()
    this.resetColors() // set color for all tiles
    return this
  }

  protected buildMembers() {
    const result = []
    for (const idx of this.grid.tileIndices) {
      const { i, x, z } = idx
      const { 'x': wx, 'z': wz } = this.grid.indexToPosition(idx)
      this.generateTile(x, z, i)
      const renderHeight = 1// placeholder // this.getNewRenderHeight(gTile, index)
      dummy.position.set(wx, renderHeight / 2, wz)
      this.tilePositions[i] = { x: wx, z: wz }
      dummy.scale.set(1, renderHeight, 1)
      dummy.updateMatrix()
      this.setMemberMatrix(i, dummy.matrix)
      result.push(this.buildTileMember(idx))
    }
    return result
  }

  updateMesh() {
    const n = this.n
    const maxD2 = Math.pow(gfxConfig.flatValues.visibleRadius, 2)

    // reset index of mesh instances for rendering
    for (const subgroup of this.subgroups) {
      subgroup.resetCount()
    }

    for (let memberIndex = 0; memberIndex < n; memberIndex++) {
      const tileIndex = this.grid.tileIndices[memberIndex]
      const { x, z } = tileIndex
      const box = this.tilePositions[memberIndex]
      const dx = box.x - this.centerXZ.x
      const dz = box.z - this.centerXZ.z
      const dSquared = dx * dx + dz * dz

      let rTile = this.generatedTiles[memberIndex]
      if (dSquared < maxD2) {
        // tile is inside visible radius

        if (rTile && rTile.exitStartTime) {
          // tile just left radius and returned
          rTile.exitStartTime = null
          rTile.entranceStartTime = Date.now()
        }
        if (!rTile) {
          rTile = this.generateTile(x, z, memberIndex)
        }

        // update mesh for this member index
        if (!rTile.style) {
          const { gTile } = rTile

          // compute styled colors only on first render
          rTile.style = style.getTileStyle({
            x, z, generatedTile: gTile,

            // support @land and @sea conditions in styles
            land: !gTile.isWater, sea: gTile.isWater,
          })
        }

        // have this member rendered
        // always re-apply mesh instance colors
        if (!this._updateRenderInstance(tileIndex, rTile)) {
          // break // reached count limit
        }
      }
      else {
        // tile is outside visible radius

        if (rTile && rTile.style) {
          // tile was generated and previously rendered

          if (!rTile.exitStartTime) {
            // tile just left visible radius
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
          }
        }
      }
    }

    // update mesh count based on what will actually be rendered
    // (should boost performance)
    for (const subgroup of this.subgroups) {
      subgroup.finalizeCount()
    }
  }

  getNewRenderHeight(tile: GeneratedTile, index: number): number {
    if (tile.isWater) {
      this.sim.resetTile(index)
      return this.getAnimatedRenderHeight(
        tile.height,
        this.sim.getWavePos(index),
      )
    }
    else {
      return this.getAnimatedRenderHeight(
        tile.height,
        0,
      )
    }
  }

  _boundaryAnim(time: number, duration: number): number {
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

  private centerXZ = { x: 0, z: 0 }

  panToCenter(x: number, z: number) {
    this.centerXZ = { x, z }

    const { x: tileX, z: tileZ } = this.grid.positionToCoord(x, z)

    const width = this.grid.width
    const depth = this.grid.depth

    const newOffsetX = tileX - Math.floor(width / 2)
    const newOffsetZ = tileZ - Math.floor(depth / 2)

    let dx = newOffsetX - this._offsetX
    let dz = newOffsetZ - this._offsetZ

    while (Math.abs(dx) > 0) {
      const s = Math.sign(dx)
      this.pan(s, 0)
      dx -= s
    }
    while (Math.abs(dz) > 0) {
      const s = Math.sign(dz)
      this.pan(0, s)
      dz -= s
    }
  }

  /**
   * Pan the terrain by one tile in one of four directions.
   * Transfer tiles from disappearing edge to newly-revealed edge.
   * @param dx The number of x grid cells (-1, 0, or 1)
   * @param dz The number of z grid cells (-1, 0, or 1)
   */
  pan(dx: number, dz: number) {
    const width = this.grid.width
    const depth = this.grid.depth

    const offsetX = this._offsetX
    const offsetZ = this._offsetZ

    if (dx !== 0) {
      const oldX = offsetX + (dx > 0 ? 0 : width - 1)
      const newX = offsetX + (dx > 0 ? width : -1)

      for (let z = offsetZ; z < offsetZ + depth; z++) {
        const idx = this.grid.xzToIndex(oldX, z)
        this.grid.updateMapping(idx, newX, z)
        this.generatedTiles[idx.i] = null
        this.tilePositions[idx.i] = this.grid.indexToPosition(idx)
      }
    }
    else if (dz !== 0) {
      const oldZ = offsetZ + (dz > 0 ? 0 : depth - 1)
      const newZ = offsetZ + (dz > 0 ? depth : -1)

      for (let x = offsetX; x < offsetX + width; x++) {
        const idx = this.grid.xzToIndex(x, oldZ)
        this.grid.updateMapping(idx, x, newZ)
        this.generatedTiles[idx.i] = null
        this.tilePositions[idx.i] = this.grid.indexToPosition(idx)
      }
    }

    this._offsetX += dx
    this._offsetZ += dz
  }

  public resetColors() {
    generator.refreshConfig()
    for (const { x, z, i } of this.grid.tileIndices) {
      this.generateTile(x, z, i)
    }
  }

  private _updateRenderInstance(tileIndex: TileIndex, rTile: RenderableTile): boolean {
    const { x, z, i: memberIndex } = tileIndex
    if (typeof x === 'undefined') {
      throw new Error(`grid has no xz for memberIndex ${memberIndex}`)
    }
    const shapeIndex = this.grid.tiling.getShapeIndex(x, z)
    if (shapeIndex < 0 || shapeIndex >= this.subgroups.length) {
      throw new Error(`grid has invalide shapeIndex ${shapeIndex} at xz ${x}, ${z}`)
    }
    const subgroup = this.subgroups[shapeIndex]
    // const [subgroup, _oldIndexInSubgroup] = this.subgroupsByFlatIndex[memberIndex]

    if (subgroup.reachedCountLimit()) {
      // reached count limit (subgroup.ts)
      return false// do nothing, not successful
    }

    // debug
    if (this.subgroupsByFlatIndex[memberIndex][0] !== subgroup) {
      throw new Error('subgroup changed')
    }

    const { gTile, style } = rTile

    const box = this.tilePositions[memberIndex]

    // distance to truncate from bottom of tile
    const cutoff = -gfxConfig.flatValues.extendBottom / this.amplitude

    let renderHeight
    if (gTile.isWater) {
      renderHeight = this.getAnimatedRenderHeight(
        gTile.height,
        this.sim.getWavePos(memberIndex),
      )
    }
    else {
      renderHeight = this.getNewRenderHeight(gTile, memberIndex)
    }
    this.members[memberIndex].height = renderHeight // height for sphere collision
    let anim
    const { entranceStartTime, exitStartTime } = rTile
    if (exitStartTime) {
      const elapsed = EXIT_DURATION - (Date.now() - exitStartTime)
      anim = this._boundaryAnim(elapsed, EXIT_DURATION)
    }
    else {
      const elapsed = Date.now() - entranceStartTime
      anim = this._boundaryAnim(elapsed, ENTR_DURATION)
    }
    const entranceOffset = -Math.min(renderHeight - cutoff, anim)
    dummy.position.set(box.x, Math.max(cutoff, renderHeight / 2 + cutoff / 2 + entranceOffset), box.z)
    dummy.scale.set(1, Math.max(0, renderHeight + entranceOffset - cutoff), 1)
    // dummy.scale.set(1, renderHeight - cutoff, 1)
    dummy.updateMatrix()
    const newIndexInSubgroup = subgroup.setMemberMatrix(memberIndex, dummy.matrix)
    this.subgroupsByFlatIndex[memberIndex] = [subgroup, newIndexInSubgroup]
    const tileMesh = subgroup.mesh as TileMesh
    tileMesh.setTileStyle(newIndexInSubgroup, style)
    return true // yes successful
  }
}

class TileIm extends TileMeshIm implements Tile {
  public wavePos: number = 0
  public height: number = 0

  constructor(
    group: TileGroup,
    index: number,
    private readonly normalNeighborIds: number[],
    public isWater: boolean,
  ) {
    super(index, group, group.subgroupsByFlatIndex[index][0])
  }

  get normal(): Vector3 {
    const neighbors = this.normalNeighborIds.map(i => this.group.members[i].height)
    return getNormal(neighbors)
  }
}

const normalNeighborOffsets = [
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
  { x: 0, z: -1 },
]

function getNormal(neighbors): Vector3 {
  // Compute normal using adjacent tile heights (central differences)
  const [hL, hR, hD, hU] = neighbors
  const sx = (hR - hL) * 0.5
  const sz = (hU - hD) * 0.5
  dummyVec.set(sx, 2, sz).normalize()
  return dummyVec
}
