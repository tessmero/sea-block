/**
 * @file tile-group.ts
 *
 * Contains an array of Tile instances and their meshes.
 */
import * as THREE from 'three'
import { Vector3 } from 'three'
import { TerrainGridIndex } from '../grid-logic/terrain-grid-index'
import { Group, InstancedMember } from './group'
import { TILE_DILATE, WAVE_AMPLITUDE } from '../settings'
import { TerrainGenerator } from '../generators/terrain-generator'
import { GeneratorConfig } from '../ui/controls-gui'
import { Tile } from '../tile'
import { TileSim } from '../physics/tile-sim'

export class TileGroup extends Group<Tile, TileSim> {
  boxPositions: { x: number, z: number }[] = []
  terrainGenerator: TerrainGenerator<GeneratorConfig> | null = null
  tileHeights: number[] = []

  private _offsetX: number = 0
  private _offsetZ: number = 0

  private readonly waterLevel: number

  private readonly amplitude: number = 20
  private readonly noiseScale: number = 1

  private readonly wdScale: number = (1 + TILE_DILATE) // dilate tile size to overlap slightly

  constructor(
    public gridIndex: TerrainGridIndex,
  ) {
    super({
      sim: new TileSim(gridIndex),
      n: gridIndex.n,
      geometry: new THREE.BoxGeometry(1, 1, 1),
      material: new THREE.MeshLambertMaterial({ color: 0xffff88, flatShading: true }),
    })

    this.waterLevel = 132
  }

  private getTileAtIndex(idx: number): Tile {
    const matrix = new THREE.Matrix4()
    this.mesh.getMatrixAt(idx, matrix)
    const position = new Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new Vector3()
    matrix.decompose(position, quaternion, scale)

    // Get logical x/z for this index
    const { x, z } = this.gridIndex.indexToXZ(idx)
    const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    const neighbors = []
    const { width, depth } = this.gridIndex
    for (const [dx, dz] of deltas) {
      // get wrapped neighbor coords
      const ox = (x + dx + width) % width
      const oz = (z + dz + depth) % depth
      const neighbor = this.gridIndex.xzToIndex(ox, oz)
      neighbors.push(neighbor)
    }

    const tile = new TileIm(
      this,
      idx,
      neighbors,
      false,
    )

    this._updateTileMember(tile, this.tileHeights[idx])

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
    for (const { x, z, index } of this.gridIndex.cells()) {
      const { x: wx, z: wz } = this.gridIndex.coordToPosition(x, z)
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
          const renderHeight = this.getAnimatedRenderHeight(height, this.sim.pos[i])
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

  getNewRenderHeight(tileHeight:number, index:number) {
    if (this.terrainGenerator && this.terrainGenerator.isWaterTile(tileHeight)) {
      this.sim.resetTile(index)
      return this.getAnimatedRenderHeight(tileHeight, this.sim.pos[index])
    }
    else {
      return this.getAnimatedRenderHeight(tileHeight, 0)
    }
  }

  getAnimatedRenderHeight(tileHeight: number, wavePos: number) {
    return tileHeight * this.amplitude / 255 + 1 + WAVE_AMPLITUDE * wavePos
  }

  panToCenter(tileX: number, tileZ: number) {
    const width = this.gridIndex.width
    const depth = this.gridIndex.depth

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
    const width = this.gridIndex.width
    const depth = this.gridIndex.depth

    const offsetX = this._offsetX
    const offsetZ = this._offsetZ

    const dummy = new THREE.Object3D()

    if (dx !== 0) {
      const oldX = offsetX + (dx > 0 ? 0 : width - 1)
      const newX = offsetX + (dx > 0 ? width : -1)

      for (let z = offsetZ; z < offsetZ + depth; z++) {
        const index = this.gridIndex.xzToIndex(oldX, z)
        this.gridIndex.updateMapping(oldX, z, newX, z)
        const { x: worldX, z: worldZ } = this.gridIndex.coordToPosition(newX, z)
        const height = this.getTileHeight(newX, z, index)
        const renderHeight = this.getNewRenderHeight(height, index)
        dummy.position.set(worldX, renderHeight / 2, worldZ)
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
        const index = this.gridIndex.xzToIndex(x, oldZ)
        this.gridIndex.updateMapping(x, oldZ, x, newZ)
        const { x: worldX, z: worldZ } = this.gridIndex.coordToPosition(x, newZ)
        const height = this.getTileHeight(x, newZ, index)
        const renderHeight = this.getNewRenderHeight(height,index)
        dummy.position.set(worldX, renderHeight / 2, worldZ)
        this.boxPositions[index] = { x: worldX, z: worldZ }
        dummy.scale.set(1, renderHeight, 1)
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
      const n = this.gridIndex.n
      for (let i = 0; i < n; i++) {
        const { x, z } = this.gridIndex.indexToXZ(i)
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
        this.setInstanceColor?.(index, new THREE.Color(r / 255, g / 255, b / 255))
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
    private readonly neighbors: number[],
    public isWater: boolean,
  ) {
    super(group.mesh, index)
  }

  get height(): number {
    return this.y * 2
  }

  get normal(): Vector3 {
    // Compute normal using adjacent tile heights (central differences)
    const [hL, hR, hD, hU] = this.neighbors.map(i => this.group.members[i].height)
    const sx = (hR - hL) * 0.5
    const sz = (hU - hD) * 0.5
    TileIm.dummy.set(-sx, 2, -sz).normalize()
    return TileIm.dummy
  }
}
