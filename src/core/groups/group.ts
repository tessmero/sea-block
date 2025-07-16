/**
 * @file group.ts
 *
 * Base class for SphereGroup and TileGroup,
 * repeated objects that have physics and graphics.
 *
 * A group has one or more subgroups.
 * Subgroups are used for tilings that have multiple tile shapes,
 * for example the octagon tiling has two subgroups (square and octagon).
 */
import * as THREE from 'three'
import type { Simulation } from '../physics/simulation'
import type { SeaBlock } from '../../sea-block'
import { physicsConfig } from '../../configs/physics-config'
import type { SubgroupParams } from './subgroup'
import { Subgroup } from './subgroup'

// parameters to construct group for type TMember (Sphere or Tile)
export interface GroupParams<TMember, TSim extends Simulation<TMember>> {
  sim: TSim // physics simulation for type TMember
  subgroups: Array<SubgroupParams>
  subgroupsByFlatIndex: Array<{
    subgroupIndex: number
    indexInSubgroup: number
  }>
}

export abstract class Group<TMember, TSim extends Simulation<TMember>> {
  public readonly n: number // number of members

  public readonly sim: TSim // physics simulation
  public readonly subgroupsByFlatIndex: Array<[Subgroup, number]>

  public members: Array<TMember> = [] // sea-block objects (spheres or tiles)

  public readonly subgroups: Array<Subgroup> = []

  constructor(params: GroupParams<TMember, TSim>) {
    this.sim = params.sim

    // count total members and assign offsets to subgroups
    this.n = 0
    for (const sub of params.subgroups) {
      this.subgroups.push(new Subgroup(sub, this.n))
      this.n += sub.n
    }
    this.subgroupsByFlatIndex = []
    params.subgroupsByFlatIndex.forEach(({ subgroupIndex, indexInSubgroup }) => {
      this.subgroups[subgroupIndex].memberIds.push(this.subgroupsByFlatIndex.length)
      this.subgroupsByFlatIndex.push([this.subgroups[subgroupIndex], indexInSubgroup])
    })
  }

  // build members and init instanced meshes
  protected abstract buildMembers(): Array<TMember>

  // update gfx meshes, called just before render
  protected abstract updateMeshes(seaBlock: SeaBlock): void

  setInstanceColor(index: number, color: THREE.Color) {
    // pick subgroup based on index
    const [subgroup, indexInSubgroup] = this.subgroupsByFlatIndex[index]
    subgroup.setInstanceColor(indexInSubgroup, color)
  }

  protected setMemberMatrix(memberIndex: number, matrix: THREE.Matrix4) {
    const [subgroup, indexInSubgroup] = this.subgroupsByFlatIndex[memberIndex]
    subgroup.mesh.setMatrixAt(indexInSubgroup, matrix)
  }

  build() {
    physicsConfig.refreshConfig()
    this.members = this.buildMembers()
    this._needsUpdate()
    return this
  }

  update(seaBlock: SeaBlock, nSteps: number) {
    for (let i = 0; i < nSteps; i++) {
      this.sim.step(this.members)
    }
    this.updateMeshes(seaBlock)
    this._needsUpdate()
  }

  private _needsUpdate() {
    this.subgroups.forEach(({ mesh }) => {
      if (mesh instanceof THREE.InstancedMesh) {
        mesh.instanceMatrix.needsUpdate = true
        if (mesh.instanceColor) {
          mesh.instanceColor.needsUpdate = true
        }
        mesh.frustumCulled = false
      }
      else {
        mesh.queueUpdate()
      }
    })
  }
}

// helper to build members that refer to position in instanced mesh
export class InstancedMember {
  private readonly posArray: THREE.TypedArray

  private readonly offset: number

  private static readonly positionDummy = new THREE.Vector3()

  constructor(
    protected readonly index: number,
    subgroup: Subgroup,
    protected readonly indexInSubgroup: number,
  ) {
    if (subgroup.mesh instanceof THREE.InstancedMesh) {
      this.posArray = subgroup.mesh.instanceMatrix.array
    }
    else {
      throw new Error('should use TileMeshIm for subgroup with TileMesh')
      // this.posArray = (subgroup.mesh as TileMesh).posArray
    }
    this.offset = indexInSubgroup * 16 + 12 // start of position in three.js mesh array
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
