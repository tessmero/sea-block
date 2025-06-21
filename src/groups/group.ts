/**
 * @file group.ts
 *
 * Base class for repeated objects that have physics and graphics.
 */
import { Simulation } from '../physics/simulation'
import * as THREE from 'three'

// parameters to construct group for type T (Sphere or Tile)
type GroupParams<T, S extends Simulation<T>> = {
  sim: S // physics simulation for type T
  n: number // number of members
  geometry: THREE.BufferGeometry // shape to render
  material: THREE.Material // material to render
}

export abstract class Group<T, S extends Simulation<T>> {
  public readonly n: number // number of members

  public readonly sim: S // physics simulation

  public members: T[] = [] // sea-block objects (spheres or tiles)

  public readonly mesh: THREE.InstancedMesh

  public readonly colors: Float32Array

  constructor(params: GroupParams<T, S>) {
    this.mesh = new THREE.InstancedMesh(
      params.geometry,
      params.material,
      params.n,
    )
    this.n = params.n
    this.sim = params.sim

    // Add per-instance color attribute
    this.colors = new Float32Array(this.n * 3)
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(
      this.colors,
      3,
    )

    const defaultColor = new THREE.Color(0xffffff)
    for (let i = 0; i < this.n; i++) {
      this.colors[i * 3 + 0] = defaultColor.r
      this.colors[i * 3 + 1] = defaultColor.g
      this.colors[i * 3 + 2] = defaultColor.b
    }
    this.mesh.instanceColor.needsUpdate = true
  }

  // build members and init instanced meshes
  protected abstract buildMembers(): T[]

  // update gfx meshes, called just before render
  protected abstract updateMesh(): void

  setInstanceColor(index: number, color: THREE.Color | string | number) {
    const c = new THREE.Color(color)
    this.colors[index * 3 + 0] = c.r
    this.colors[index * 3 + 1] = c.g
    this.colors[index * 3 + 2] = c.b
    this.mesh.instanceColor!.needsUpdate = true
  }

  setAllInstanceColors(colors: (THREE.Color | string | number)[]) {
    for (let i = 0; i < colors.length; i++) {
      this.setInstanceColor(
        i,
        colors[i],
      )
    }
  }

  build() {
    this.members = this.buildMembers()
    this.mesh.instanceMatrix.needsUpdate = true
    this.mesh.instanceColor!.needsUpdate = true
    return this
  }

  update(nSteps: number) {
    for (let i = 0; i < nSteps; i++) {
      this.sim.step(this.members)
    }
    this.mesh.instanceMatrix.needsUpdate = true
    this.mesh.instanceColor!.needsUpdate = true
  }
}

// helper to build members that refer to position in instanced mesh
export class InstancedMember {
  private readonly posArray: THREE.TypedArray

  private readonly offset: number

  private static readonly positionDummy = new THREE.Vector3()

  constructor(
    mesh: THREE.InstancedMesh,
    protected readonly index: number,
  ) {
    this.posArray = mesh.instanceMatrix.array
    this.offset = index * 16 + 12
  }

  get y(): number {
    return this.posArray[this.offset + 1]
  }

  get position() {
    const { posArray } = this
    let { offset } = this
    InstancedMember.positionDummy.set(
      posArray[offset++],
      posArray[offset++],
      posArray[offset++],
    )
    return InstancedMember.positionDummy
  }

  set position(pos: THREE.Vector3) {
    const { posArray } = this
    let { offset } = this
    posArray[offset++] = pos.x
    posArray[offset++] = pos.y
    posArray[offset++] = pos.z
  }
}
