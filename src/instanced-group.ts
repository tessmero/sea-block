import * as THREE from 'three'

interface InstancedMeshConfig {
  count: number
  geometry: THREE.BufferGeometry
  material: THREE.Material
}

export abstract class InstancedGroup {
  mesh: THREE.InstancedMesh
  colors: Float32Array

  constructor(config: InstancedMeshConfig) {
    this.mesh = new THREE.InstancedMesh(
      config.geometry,
      config.material,
      config.count,
    )
    // Add per-instance color attribute
    this.colors = new Float32Array(config.count * 3)
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(this.colors, 3)

    const defaultColor = new THREE.Color(0xffffff)
    for (let i = 0; i < config.count; i++) {
      this.colors[i * 3 + 0] = defaultColor.r
      this.colors[i * 3 + 1] = defaultColor.g
      this.colors[i * 3 + 2] = defaultColor.b
    }
    this.mesh.instanceColor.needsUpdate = true
  }

  setInstanceColor(index: number, color: THREE.Color | string | number) {
    const c = new THREE.Color(color)
    this.colors[index * 3 + 0] = c.r
    this.colors[index * 3 + 1] = c.g
    this.colors[index * 3 + 2] = c.b
    this.mesh.instanceColor!.needsUpdate = true
  }

  setAllInstanceColors(colors: (THREE.Color | string | number)[]) {
    for (let i = 0; i < colors.length; i++) {
      this.setInstanceColor(i, colors[i])
    }
  }

  build() {
    this.buildInstances()
    this.mesh.instanceMatrix.needsUpdate = true
    this.mesh.instanceColor!.needsUpdate = true
    return this
  }

  update(nSteps: number) {
    for (let i = 0; i < nSteps; i++) {
      this.step()
    }
    this.mesh.instanceMatrix.needsUpdate = true
    this.mesh.instanceColor!.needsUpdate = true
  }

  /** Build all instance matrices and any per-instance data */
  protected abstract buildInstances(): void

  protected abstract step(): void
}
