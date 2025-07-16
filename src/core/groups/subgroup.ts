/**
 * @file subgroup.ts
 *
 * Subgroups are used for tilings that have multiple tile shapes,
 * for example the octagon tiling has two subgroups (square and octagon).
 */
import * as THREE from 'three'
import type { TileGeom } from '../../gfx/3d/tile-mesh'
import { TileMesh } from '../../gfx/3d/tile-mesh'
import { ColoredInstancedMesh } from '../../gfx/3d/colored-instanced-mesh'

export interface SubgroupParams {
  n: number // number of members
  geometry: THREE.BufferGeometry | TileGeom // shape to render
}

export class Subgroup {
  private readonly n: number
  public readonly mesh: ColoredInstancedMesh | TileMesh
  public readonly memberIds: Array<number> = []

  constructor(
    params: SubgroupParams,
    public readonly offset: number,
  ) {
    this.n = params.n

    if (params.geometry instanceof THREE.BufferGeometry) {
      this.mesh = new ColoredInstancedMesh(
        params.geometry,
        new THREE.MeshLambertMaterial({
          color: 0xffffff,
          flatShading: true,
        }),
        this.n,
      )
    }
    else {
      this.mesh = new TileMesh(params.geometry, this.n)
    }
  }

  addToScene(scene: THREE.Scene) {
    if (this.mesh instanceof THREE.InstancedMesh) {
      scene.add(this.mesh)
    }
    else {
      scene.add(...(this.mesh).meshes)
    }
  }

  setInstanceColor(index: number, color: THREE.Color) {
    if (this.mesh instanceof ColoredInstancedMesh) {
      this.mesh.setInstanceColor(index, color)
    }
    else {
      throw new Error('subgroups with tile mesh should use setTileStyle')
    }
  }

  private _counter: number = 0

  public resetCount() {
    this._counter = 0
  }

  public reachedCountLimit() {
    // check if reached allocated mesh count limit
    // (this can happen when exiting tiles request to be rendered temporarily)
    // do nothing and give up rendering any more tiles (tile-group.ts)
    return this._counter >= this.n
  }

  public setMemberMatrix(memberIndex: number, matrix: THREE.Matrix4): number {
    const indexInSubgroup = this._counter++
    this.mesh.setMatrixAt(indexInSubgroup, matrix)
    this.memberIds[indexInSubgroup] = memberIndex
    return indexInSubgroup
  }

  public finalizeCount() {
    this.mesh.count = this._counter
  }
}
