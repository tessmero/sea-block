/**
 * @file tile-group.ts
 *
 * Terrain and water tiles in a grid, which can be panned
 * by transfering tiles from one edge to the opposite edge.
 *
 * Uses gfx/tile-group-gfx-helper.ts to manage meshes.
 */
import * as THREE from 'three'
import type { Vector3 } from 'three'
import type { SeaBlock } from 'sea-block'
import type { TiledGrid, TilePosition } from '../grid-logic/tiled-grid'
import type { Tile } from '../tile'
import { WaterSim } from '../physics/water-sim'
import type { TileIndex } from '../grid-logic/indexed-grid'
import type { RenderableTile } from '../../gfx/3d/tile-group-gfx-helper'
import { TileGroupGfxHelper } from '../../gfx/3d/tile-group-gfx-helper'
import { extrude, TileMeshIm } from '../../gfx/3d/tile-mesh'
import { gfxConfig } from '../../configs/gfx-config'
import { Group } from './group'

export type TileOverrides = {
  height?: number
  isWater?: boolean
  isFlora?: boolean
  isVisible?: boolean
}

const dummy = new THREE.Object3D()
const dummyVec = new THREE.Vector3()
export class TileGroup extends Group<Tile, WaterSim> {
  public readonly tilePositions: Array<TilePosition> = [] // grid tiling data
  public readonly generatedTiles: Array<RenderableTile | null> = [] // gfx data
  public readonly gfxHelper: TileGroupGfxHelper

  // current panning position
  private _offsetX = 0
  private _offsetZ = 0

  private get generator() { return this.seaBlock.generator }

  constructor(
    public grid: TiledGrid,
    private readonly seaBlock: SeaBlock,
  ) {
    // count number of tiles per subgroup
    const subgroups = grid.tiling.shapes
      .map(shape => extrude(shape))
      .map(tileExt => ({
        n: 0,
        geometry: tileExt,
      }))
    const subgroupsByFlatIndex: Array<{ subgroupIndex: number, indexInSubgroup: number }> = []

    for (const { x, z } of grid.tileIndices) {
      const sgIndex = grid.tiling.getShapeIndex(x, z)
      subgroupsByFlatIndex.push({
        subgroupIndex: sgIndex,
        indexInSubgroup: subgroups[sgIndex].n,
      })
      subgroups[sgIndex].n++
    }

    super({
      sim: new WaterSim(grid),
      subgroups,
      subgroupsByFlatIndex,
    })

    this.gfxHelper = new TileGroupGfxHelper(this)
    gfxConfig.refreshConfig()
  }

  protected updateMeshes(seaBlock: SeaBlock, dt: number): void {
    this.gfxHelper.updateTileMeshes(seaBlock.style, dt)
  }

  private buildTileMember(idx: TileIndex): Tile {
    const { i, x, z } = idx
    const deltas = normalNeighborOffsets
    const neighbors: Array<number> = []
    const { width, depth } = this.grid
    for (const { 'x': dx, 'z': dz } of deltas) {
      // get wrapped neighbor coords
      const ox = (x + dx + width) % width
      const oz = (z + dz + depth) % depth
      const neighbor = this.grid.xzToIndex(ox, oz)!.i
      neighbors.push(neighbor)
    }

    const tile = new TileIm(this, i, neighbors)
    // tile.y = 2 * this.generatedTiles[idx].height

    return tile
  }

  public overrideTile(idx: TileIndex, values: TileOverrides) {
    const { i } = idx
    const member = this.members[i]
    const gTile = this.generatedTiles[i]?.gTile
    for (const prop in values) {
      member[prop] = values[prop]
      if (gTile) {
        gTile[prop] = values[prop]
      }
    }
  }

  public generateTile(idx: TileIndex): RenderableTile {
    // console.log(`generate tile ${this.generator.constructor.name} ${this.generator.flatConfig.peaks}`)

    const { i, x, z } = idx
    const result = {
      gTile: this.generator.getTile(x, z),
    }
    this.generatedTiles[i] = result

    // update water if called after members constructed
    if (i < this.members.length) {
      this.members[i].isWater = result.gTile.isWater
      this.members[i].isFlora = result.gTile.isFlora
    }

    return result
  }

  build() {
    super.build()
    this.resetColors() // set color for all tiles
    return this
  }

  protected buildMembers() {
    const result: Array<Tile> = []
    for (const idx of this.grid.tileIndices) {
      const { i } = idx
      const { 'x': wx, 'z': wz } = this.grid.indexToPosition(idx)
      // this.generateTile(idx)
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

  public centerXZ = { x: 0, z: 0 }

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
        if (idx) {
          this.grid.updateMapping(idx, newX, z)
          this.generatedTiles[idx.i] = null
          this.tilePositions[idx.i] = this.grid.indexToPosition(idx)
        }
      }
    }
    else if (dz !== 0) {
      const oldZ = offsetZ + (dz > 0 ? 0 : depth - 1)
      const newZ = offsetZ + (dz > 0 ? depth : -1)

      for (let x = offsetX; x < offsetX + width; x++) {
        const idx = this.grid.xzToIndex(x, oldZ)
        if (idx) {
          this.grid.updateMapping(idx, x, newZ)
          this.generatedTiles[idx.i] = null
          this.tilePositions[idx.i] = this.grid.indexToPosition(idx)
        }
      }
    }

    this._offsetX += dx
    this._offsetZ += dz
  }

  public resetColors() {
    // this.generator.refreshConfig()
    this.generatedTiles.fill(null)
    this.gfxHelper.liveRenderHeights.fill(NaN)
    this.gfxHelper.restoreTileColors()
    // for (const gTile of this.generatedTiles) {
    //   if (gTile) {
    //     gTile.style = undefined
    //   }
    // }
  }
}

class TileIm extends TileMeshIm implements Tile {
  public wavePos = 0
  public height = 0
  public isWater = false
  public isFlora = false
  public isVisible = false

  constructor(
    group: TileGroup,
    index: number,
    private readonly normalNeighborIds: Array<number>,
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

function getNormal(neighbors: Array<number>): Vector3 {
  // Compute normal using adjacent tile heights (central differences)
  const [hL, hR, hD, hU] = neighbors
  const sx = (hR - hL) * 0.5
  const sz = (hU - hD) * 0.5
  dummyVec.set(sx, 2, sz).normalize()
  return dummyVec
}
