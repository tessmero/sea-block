import * as THREE from 'three'
import { TerrainGridConfig } from './terrain-grid-config'
import { InstancedGroup } from './instanced-group'
import { PhysicsTiles } from './physics-tiles'
import { TILE_DILATE, STEP_DURATION, WAVE_AMPLITUDE } from './settings'
import { TerrainGenerator } from './terrain-generator'
import { ControlsConfig } from './controls'

type CollisionBox = {
  center: { x: number, y: number, z: number }
  dimensions: { x: number, y: number, z: number }
  isWaterTile: boolean
}

export class BoxTerrain extends InstancedGroup {
  boxPositions: { x: number, z: number }[] = []
  physicsTiles: PhysicsTiles | null = null
  terrainGenerator: TerrainGenerator<ControlsConfig> | null = null
  tileHeights: number[] = []
  collisionBoxes: CollisionBox[] = []

  private _offsetX: number = 0
  private _offsetZ: number = 0

  private waterLevel: number

  constructor(
    public config: TerrainGridConfig,
    public amplitude: number = 20,
    public noiseScale: number = 1,
  ) {
    super({
      count: config.n,
      geometry: new THREE.BoxGeometry(1, 1, 1),
      material: new THREE.MeshLambertMaterial({ color: 0xffff88, flatShading: true }),
    })

    this.waterLevel = 132 * this.amplitude / 255 + 1
  }

  public getCollisionBoxAtIndex(idx: number): CollisionBox {
    const matrix = new THREE.Matrix4()
    this.mesh.getMatrixAt(idx, matrix)
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    matrix.decompose(position, quaternion, scale)

    // Get logical x/z for this index
    const { x, z } = this.config.indexToXZ(idx)

    // Compute normal using adjacent tile heights (central differences)
    // If out of bounds, use current tile height for missing neighbors
    const getHeight = (xi: number, zi: number) => {
      const neighborIdx = this.config.xzToIndex(xi, zi)
      if (neighborIdx >= 0 && neighborIdx < this.tileHeights.length) {
        return this.tileHeights[neighborIdx]
      }
      return this.tileHeights[idx]
    }
    const hL = getHeight(x - 1, z)
    const hR = getHeight(x + 1, z)
    const hD = getHeight(x, z - 1)
    const hU = getHeight(x, z + 1)
    const sx = (hR - hL) * 0.5
    const sz = (hU - hD) * 0.5
    const normalVec = new THREE.Vector3(-sx, 2, -sz).normalize()
    const normal = { x: normalVec.x, y: normalVec.y, z: normalVec.z }

    const box = {
      center: { x: position.x, y: position.y, z: position.z },
      dimensions: { x: scale.x, y: scale.y, z: scale.z },
      normal, // computed normal
      isWaterTile: true,
    }

    if (this.terrainGenerator) {
      box.isWaterTile = this.terrainGenerator.isWaterTile(x, z)
    }

    return box
  }

  private getTileHeight(x: number, z: number, index: number): number {
    let result = 1
    if (this.terrainGenerator) {
      result = this.terrainGenerator.getHeight(
        x * this.noiseScale,
        z * this.noiseScale,
      ) * this.amplitude / 255 + 1
      if (result < this.waterLevel) {
        result = this.waterLevel
      }
    }

    this.tileHeights[index] = result
    return result
  }

  protected buildInstances() {
    const dummy = new THREE.Object3D()
    const wdScale = this.config.meshScale * (1 + TILE_DILATE) // dilate to slightly overlap tiles
    for (const { x, z, index } of this.config.cells()) {
      const { x: wx, z: wz } = this.config.coordToPosition(x, z)
      const height = this.getTileHeight(x, z, index)
      dummy.position.set(wx, height / 2, wz)
      this.boxPositions[index] = { x: wx, z: wz }
      dummy.scale.set(wdScale, height, wdScale)
      dummy.updateMatrix()
      this.mesh.setMatrixAt(index, dummy.matrix)

      // Set color if generator is present
      this._updateTileColor(x, z, index)
    }
  }

  step() {
    if (this.physicsTiles) {
      this.physicsTiles.update(STEP_DURATION)
    }
  }

  updateMesh() {
    if (this.physicsTiles && this.terrainGenerator) {
      const dummy = new THREE.Object3D()
      const n = this.config.n
      for (let i = 0; i < n; i++) {
        const { x, z } = this.config.indexToXZ(i)
        const terrainHeight = this.tileHeights[i]
        if (this.terrainGenerator.isWaterTile(x, z)) {
          const height = terrainHeight + WAVE_AMPLITUDE * this.physicsTiles.getPos(i)
          const box = this.boxPositions[i]
          dummy.position.set(box.x, height / 2, box.z)
          dummy.scale.set(1, height, 1)
          dummy.updateMatrix()
          this.mesh.setMatrixAt(i, dummy.matrix)
        }
      }
      this.mesh.instanceMatrix.needsUpdate = true
    }
  }

  panToCenter(tileX: number, tileZ: number) {
    const width = this.config.widthSegments
    const depth = this.config.depthSegments

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
   * Pan the terrain by dx, dz grid cells.
   * Only updates edge boxes that move to the opposite edge.
   */
  pan(dx: number, dz: number) {
    const width = this.config.widthSegments
    const depth = this.config.depthSegments

    const offsetX = this._offsetX
    const offsetZ = this._offsetZ

    const dummy = new THREE.Object3D()

    if (dx !== 0) {
      const oldX = offsetX + (dx > 0 ? 0 : width - 1)
      const newX = offsetX + (dx > 0 ? width : -1)

      for (let z = offsetZ; z < offsetZ + depth; z++) {
        const index = this.config.xzToIndex(oldX, z)
        this.config.updateMapping(oldX, z, newX, z)
        const { x: worldX, z: worldZ } = this.config.coordToPosition(newX, z)
        const height = this.getTileHeight(newX, z, index)
        dummy.position.set(worldX, height / 2, worldZ)
        this.boxPositions[index] = { x: worldX, z: worldZ }
        dummy.scale.set(this.config.meshScale, height, this.config.meshScale)
        dummy.updateMatrix()
        this.mesh.setMatrixAt(index, dummy.matrix)

        // Set color if generator is present
        this._updateTileColor(newX, z, index)
      }
    }
    else if (dz !== 0) {
      const oldZ = offsetZ + (dz > 0 ? 0 : depth - 1)
      const newZ = offsetZ + (dz > 0 ? depth : -1)

      for (let x = offsetX; x < offsetX + width; x++) {
        const index = this.config.xzToIndex(x, oldZ)
        this.config.updateMapping(x, oldZ, x, newZ)
        const { x: worldX, z: worldZ } = this.config.coordToPosition(x, newZ)
        const height = this.getTileHeight(x, newZ, index)
        dummy.position.set(worldX, height / 2, worldZ)
        this.boxPositions[index] = { x: worldX, z: worldZ }
        dummy.scale.set(this.config.meshScale, height, this.config.meshScale)
        dummy.updateMatrix()
        this.mesh.setMatrixAt(index, dummy.matrix)

        // Set color if generator is present
        this._updateTileColor(x, newZ, index)
      }
    }

    this._offsetX += dx
    this._offsetZ += dz
    this.mesh.instanceMatrix.needsUpdate = true
  }

  public resetColors() {
    if (this.terrainGenerator) {
      this.terrainGenerator.loadConfig()
      const n = this.config.n
      for (let i = 0; i < n; i++) {
        const { x, z } = this.config.indexToXZ(i)
        this._updateTileColor(x, z, i)
      }
    }
    this.mesh.instanceMatrix.needsUpdate = true
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
