/**
 * @file tile-group.ts
 *
 * Contains an array of Tile instances and their meshes.
 */
import * as THREE from 'three'
import { Vector3 } from 'three'
import { GridLayout } from '../grid-logic/grid-layout'
import { Group, InstancedMember } from './group'
import { TILE_DILATE } from '../settings'
import { physicsConfig } from '../configs/physics-config'
import { TerrainGenerator } from '../generators/terrain-generator'
import { Config } from '../configs/config'
import { Tile } from '../tile'
import { TileSim } from '../physics/tile-sim'

export class TileGroup extends Group<Tile, TileSim> {
  boxPositions: { x: number, z: number }[] = []

  terrainGenerator: TerrainGenerator<Config> | null = null

  tileHeights: number[] = []

  private _offsetX: number = 0

  private _offsetZ: number = 0

  private readonly waterLevel: number

  private readonly amplitude: number = 20

  private readonly noiseScale: number = 1

  private readonly wdScale: number = 1 + TILE_DILATE // dilate tile size to overlap slightly

  constructor(public grid: GridLayout) {
    super({
      sim: new TileSim(grid),
      n: grid.n,
      geometry: grid.geometry,
      material: new THREE.MeshLambertMaterial({ color: 0xffff88,
        flatShading: true }),
    })

    this.waterLevel = 132
  }

  private getTileAtIndex(idx: number): Tile {
    const matrix = new THREE.Matrix4()
    this.mesh.getMatrixAt(
      idx,
      matrix,
    )
    const position = new Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new Vector3()
    matrix.decompose(
      position,
      quaternion,
      scale,
    )

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

    const tile = new TileIm(this, idx, neighbors, false)

    this._updateTileMember(
      tile,
      this.tileHeights[idx],
    )

    return tile
  }

  private getTileHeight(x: number, z: number, index: number): number {
    let result = 1
    if (this.terrainGenerator) {
      result = this.terrainGenerator.getHeight(
        x * this.noiseScale,
        z * this.noiseScale,
      )
      if (result < this.waterLevel) {
        result = this.waterLevel
      }
    }

    this.tileHeights[index] = result
    return result
  }

  protected buildMembers() {
    const result = []
    const dummy = new THREE.Object3D()
    for (const { x, z, index } of this.grid.cells()) {
      const { 'x': wx, 'z': wz } = this.grid.coordToPosition(x, z)
      const height = this.getTileHeight(x, z, index)
      const renderHeight = this.getNewRenderHeight(height, index)
      dummy.position.set(wx, renderHeight / 2, wz)
      this.boxPositions[index] = { x: wx, z: wz }
      dummy.scale.set(this.wdScale, renderHeight, this.wdScale)
      dummy.updateMatrix()
      this.mesh.setMatrixAt(index, dummy.matrix)

      // Set color if generator is present
      this._updateTileColor(x, z, index)

      result.push(this.getTileAtIndex(index))
    }
    return result
  }

  updateMesh() {
    if (this.terrainGenerator && this.sim) {
      const dummy = new THREE.Object3D()
      const n = this.n
      for (let i = 0; i < n; i++) {
        const height = this.tileHeights[i]
        if (this.terrainGenerator.isWaterTile(height)) {
          const renderHeight = this.getAnimatedRenderHeight(
            height,
            this.sim.pos[i],
          )
          const box = this.boxPositions[i]
          dummy.position.set(box.x, renderHeight / 2, box.z)
          dummy.scale.set(1, renderHeight, 1)
          dummy.updateMatrix()
          this.mesh.setMatrixAt(i, dummy.matrix)
        }
      }
      this.mesh.instanceMatrix.needsUpdate = true
    }
  }

  getNewRenderHeight(tileHeight: number, index: number) {
    if (this.terrainGenerator && this.terrainGenerator.isWaterTile(tileHeight)) {
      this.sim.resetTile(index)
      return this.getAnimatedRenderHeight(
        tileHeight,
        this.sim.pos[index],
      )
    }
    else {
      return this.getAnimatedRenderHeight(
        tileHeight,
        0,
      )
    }
  }

  getAnimatedRenderHeight(tileHeight: number, wavePos: number) {
    const amp = physicsConfig.params.WAVE_AMPLITUDE.value
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
        const height = this.getTileHeight(newX, z, index)
        const renderHeight = this.getNewRenderHeight(height, index)
        dummy.position.set(
          worldX,
          renderHeight / 2,
          worldZ,
        )
        this.boxPositions[index] = { x: worldX, z: worldZ }
        dummy.scale.set(1, renderHeight, 1)
        dummy.updateMatrix()
        this.mesh.setMatrixAt(index, dummy.matrix)

        // Set color if generator is present
        this._updateTileColor(newX, z, index)
        this._updateTileMember(this.members[index], height)
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
        const height = this.getTileHeight(x, newZ, index)
        const renderHeight = this.getNewRenderHeight(height, index)
        dummy.position.set(worldX, renderHeight / 2, worldZ)
        this.boxPositions[index] = { x: worldX, z: worldZ }
        dummy.scale.set(1, renderHeight, 1,
        )
        dummy.updateMatrix()
        this.mesh.setMatrixAt(index, dummy.matrix)

        // Set color if generator is present
        this._updateTileColor(x, newZ, index)
        this._updateTileMember(this.members[index], height)
      }
    }

    this._offsetX += dx
    this._offsetZ += dz
    this.mesh.instanceMatrix.needsUpdate = true
  }

  public resetColors() {
    if (this.terrainGenerator) {
      this.terrainGenerator.loadConfig()
      const n = this.grid.n
      for (let i = 0; i < n; i++) {
        const { x, z } = this.grid.indexToXZ(i)
        this._updateTileColor(x, z, i)
      }
    }
    this.mesh.instanceMatrix.needsUpdate = true
  }

  private _updateTileMember(tile: Tile, height: number) {
    if (this.terrainGenerator) {
      tile.isWater = this.terrainGenerator.isWaterTile(height)
    }
  }

  private _updateTileColor(x: number, z: number, index: number) {
    if (this.terrainGenerator) {
      const color = this.terrainGenerator.getTileColor(x, z)
      if (color) {
        // Convert RGBA [0-255] to THREE.Color and set alpha if needed
        const [r, g, b] = color
        this.setInstanceColor?.(
          index,
          new THREE.Color(r / 255, g / 255, b / 255),
        )
        // Alpha (a) can be handled if you use a material that supports transparency
      }
    }
  }
}

class TileIm extends InstancedMember implements Tile {
  private static readonly dummy = new Vector3()

  public wavePos: number = 0

  constructor(
    private readonly group: TileGroup,
    index: number,
    private readonly normalNeighborIds: number[],
    public isWater: boolean,
  ) {
    super(group.mesh, index)
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
