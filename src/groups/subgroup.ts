/**
 * @file subgroup.ts
 *
 * Subgroups are used for tilings that have multiple tile shapes,
 * for example the octagon tiling has two subgroups (square and octagon).
 */
import * as THREE from 'three'
import { TileExt, TileMesh } from '../gfx/tile-mesh'
import { ColoredMesh } from '../gfx/colored-mesh'

export type SubgroupParams = {
  n: number // number of members
  geometry: THREE.BufferGeometry | TileExt // shape to render
}

export class Subgroup {
  private readonly n: number
  public readonly mesh: ColoredMesh | TileMesh
  public readonly memberIds: number[] = []

  constructor(
    params: SubgroupParams,
    public readonly offset: number,
  ) {
    this.n = params.n

    if (params.geometry instanceof THREE.BufferGeometry) {
      this.mesh = new ColoredMesh(
        params.geometry,
        new THREE.MeshLambertMaterial({
          color: 0xffffff,
          flatShading: true,
        }),
        this.n,
      )
    }
    else {
      this.mesh = new TileMesh(params.geometry as TileExt, this.n)
    }
  }

  addToScene(scene: THREE.Scene) {
    if (this.mesh instanceof THREE.InstancedMesh) {
      scene.add(this.mesh)
    }
    else {
      scene.add(...(this.mesh as TileMesh)._meshes)
    }
  }

  setInstanceColor(index: number, color: THREE.Color) {
    if (this.mesh instanceof ColoredMesh) {
      this.mesh.setInstanceColor(index, color)
    }
    else {
      throw new Error('subgroups with tile mesh should use setTileStyle')
    }
  }
}
