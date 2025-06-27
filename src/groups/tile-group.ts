/**
 * @file tile-group.ts
 *
 * Contains an array of Tile instances and their meshes.
 */
import * as THREE from 'three'
import { Vector3 } from 'three'
import { GridLayout } from '../grid-logic/grid-layout'
import { Group } from './group'
import { TILE_DILATE } from '../settings'
import { physicsConfig } from '../configs/physics-config'
import { GeneratedTile } from '../generators/terrain-generator'
import { Tile } from '../tile'
import { TileSim } from '../physics/tile-sim'
import { extrude, TileMesh, TileMeshIm } from '../gfx/tile-mesh'
import { generator, style } from '../main'

export class TileGroup extends Group<Tile, TileSim> {
  boxPositions: { x: number, z: number }[] = []

  generatedTiles: GeneratedTile[] = []

  private _offsetX: number = 0

  private _offsetZ: number = 0

  private readonly waterLevel: number

  private readonly amplitude: number = 20

  private readonly noiseScale: number = 1

  private readonly wdScale: number = 1 + TILE_DILATE // dilate tile size to overlap slightly

  constructor(public grid: GridLayout) {
    // count number of tiles per subgroup
    const subgroups = grid.tiling.shapes
      .map(shape => extrude(shape))
      .map(tileExt => ({
        n: 0,
        geometry: tileExt,
      }))
    const subgroupsByFlatIndex: { subgroupIndex: number, indexInSubgroup: number }[] = []

    for (const { x, z } of grid.cells()) {
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

  private buildTileMember(idx: number): Tile {
    // Get logical x/z for this index
    const { x, z } = this.grid.indexToXZ(idx)
    const deltas = normalNeighborOffsets
    const neighbors = []
    const { width, depth } = this.grid
    for (const { 'x': dx, 'z': dz } of deltas) {
      // get wrapped neighbor coords
      const ox = (x + dx + width) % width
      const oz = (z + dz + depth) % depth
      const neighbor = this.grid.xzToIndex(ox, oz)
      neighbors.push(neighbor)
    }

    const gTile = this.generatedTiles[idx]
    const tile = new TileIm(this, idx, neighbors, gTile.isWater)
    // tile.y = 2 * this.generatedTiles[idx].height

    return tile
  }

  private generateTile(x, z, index): GeneratedTile {
    const result = generator.getTile(
      x * this.noiseScale,
      z * this.noiseScale,
    )
    this.generatedTiles[index] = result
    if (index < this.members.length) {
      this.members[index].isWater = result.isWater
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
    const dummy = new THREE.Object3D()
    for (const { x, z, index } of this.grid.cells()) {
      const { 'x': wx, 'z': wz } = this.grid.coordToPosition(x, z)
      const gTile = this.generateTile(x, z, index)
      const renderHeight = this.getNewRenderHeight(gTile, index)
      dummy.position.set(wx, renderHeight / 2, wz)
      this.boxPositions[index] = { x: wx, z: wz }
      dummy.scale.set(this.wdScale, renderHeight, this.wdScale)
      dummy.updateMatrix()
      this.setMemberMatrix(index, dummy.matrix)
      result.push(this.buildTileMember(index))
    }
    return result
  }

  updateMesh() {
    if (this.sim) {
      const dummy = new THREE.Object3D()
      const n = this.n
      for (let i = 0; i < n; i++) {
        const gTile = this.generatedTiles[i]
        if (gTile.isWater) {
          const renderHeight = this.getAnimatedRenderHeight(
            gTile.height,
            this.sim.pos[i],
          )
          const box = this.boxPositions[i]
          dummy.position.set(box.x, renderHeight / 2, box.z)
          dummy.scale.set(1, renderHeight, 1)
          dummy.updateMatrix()
          this.setMemberMatrix(i, dummy.matrix)
        }
      }
    }
  }

  getNewRenderHeight(tile: GeneratedTile, index: number): number {
    if (tile.isWater) {
      this.sim.resetTile(index)
      return this.getAnimatedRenderHeight(
        tile.height,
        this.sim.pos[index],
      )
    }
    else {
      return this.getAnimatedRenderHeight(
        tile.height,
        0,
      )
    }
  }

  getAnimatedRenderHeight(tileHeight: number, wavePos: number) {
    const amp = physicsConfig.flatValues.WAVE_AMPLITUDE
    return tileHeight * this.amplitude / 255 + 1 + amp * wavePos
  }

  panToCenter(tileX: number, tileZ: number) {
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

    const dummy = new THREE.Object3D()

    if (dx !== 0) {
      const oldX = offsetX + (dx > 0 ? 0 : width - 1)
      const newX = offsetX + (dx > 0 ? width : -1)

      for (let z = offsetZ; z < offsetZ + depth; z++) {
        const index = this.grid.xzToIndex(oldX, z)
        this.grid.updateMapping(oldX, z, newX, z)
        const { 'x': worldX, 'z': worldZ } = this.grid.coordToPosition(newX, z)
        const gTile = this.generateTile(newX, z, index)
        const renderHeight = this.getNewRenderHeight(gTile, index)
        dummy.position.set(
          worldX,
          renderHeight / 2,
          worldZ,
        )
        this.boxPositions[index] = { x: worldX, z: worldZ }
        dummy.scale.set(1, renderHeight, 1)
        dummy.updateMatrix()
        this.setMemberMatrix(index, dummy.matrix)

        // Set color if generator is present
        this._updateTileColor(newX, z, index)
      }
    }
    else if (dz !== 0) {
      const oldZ = offsetZ + (dz > 0 ? 0 : depth - 1)
      const newZ = offsetZ + (dz > 0 ? depth : -1)

      for (let x = offsetX; x < offsetX + width; x++) {
        const index = this.grid.xzToIndex(x, oldZ)
        this.grid.updateMapping(x, oldZ, x, newZ)
        const { 'x': worldX, 'z': worldZ } = this.grid.coordToPosition(
          x,
          newZ,
        )
        const gTile = this.generateTile(x, newZ, index)
        const renderHeight = this.getNewRenderHeight(gTile, index)
        dummy.position.set(worldX, renderHeight / 2, worldZ)
        this.boxPositions[index] = { x: worldX, z: worldZ }
        dummy.scale.set(1, renderHeight, 1)
        dummy.updateMatrix()
        this.setMemberMatrix(index, dummy.matrix)

        // Set color if generator is present
        this._updateTileColor(x, newZ, index)
      }
    }

    this._offsetX += dx
    this._offsetZ += dz
  }

  public resetColors() {
    generator.refreshConfig()
    const n = this.grid.n
    for (let i = 0; i < n; i++) {
      const { x, z } = this.grid.indexToXZ(i)
      this._updateTileColor(x, z, i)
    }
  }

  private _updateTileColor(x: number, z: number, index: number) {
    const gTile = this.generatedTiles[index]
    const tileStyle = style.getTileStyle({
      x, z, generatedTile: gTile,

      // support @land and @sea conditions in styles
      land: !gTile.isWater, sea: gTile.isWater,
    })
    const [subgroup, indexInSubgroup] = this.subgroupsByFlatIndex[index]
    const tileMesh = subgroup.mesh as TileMesh
    tileMesh.setTileStyle(indexInSubgroup, tileStyle)
  }
}

class TileIm extends TileMeshIm implements Tile {
  private static readonly dummy = new Vector3()

  public wavePos: number = 0

  constructor(
    private readonly group: TileGroup,
    index: number,
    private readonly normalNeighborIds: number[],
    public isWater: boolean,
  ) {
    const [subgroup, indexInSubgroup] = group.subgroupsByFlatIndex[index]
    super(index, subgroup, indexInSubgroup)
  }

  get height(): number {
    return this.y * 2
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

const dummy = new Vector3()
function getNormal(neighbors): Vector3 {
  // Compute normal using adjacent tile heights (central differences)
  const [hL, hR, hD, hU] = neighbors
  const sx = (hR - hL) * 0.5
  const sz = (hU - hD) * 0.5
  dummy.set(sx, 2, sz).normalize()
  return dummy
}
