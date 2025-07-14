/**
 * @file composite-mesh.ts
 *
 * Base classes for objects composed of solid-colored parts.
 *
 * CompositeMesh is used for unique objects like gui elements.
 * CompositeInstancedMesh is used for repeated objects like tiles.
 */

import type { Matrix4 } from 'three'
import { Group, Mesh } from 'three'
import { MeshBasicMaterial, type BufferGeometry } from 'three'
import type { CompositeElement, CompositeStyle } from '../composite-element'
import { ColoredMesh } from './colored-instanced-mesh'

// shapes for each part of a composite
export type CompositeGeometry<TPart extends string = string> = {
  [part in TPart]: BufferGeometry
}

export abstract class CompositeMesh<TPart extends string = string>
  extends Group // THREE object group
  implements CompositeElement<TPart> {
  abstract readonly partNames: ReadonlyArray<TPart>
  private readonly meshes: Array<Mesh> = []

  constructor(
    partGeometries: CompositeGeometry<TPart>,
  ) {
    super()

    let name: TPart
    for (name in partGeometries) {
      const mesh = new Mesh(
        partGeometries[name],
        new MeshBasicMaterial({ color: 0xffffff }),
      )
      this.meshes.push(mesh)
      this.add(mesh)
    }
  }

  public setStyle(style: CompositeStyle<TPart>) {
    this.partNames.forEach((name, meshIndex) => {
      (this.meshes[meshIndex].material as MeshBasicMaterial).color = style[name]
    })
  }
}

export abstract class CompositeInstancedMesh<TPart extends string>
implements CompositeElement<TPart> {
  abstract partNames: ReadonlyArray<TPart> // subclasses define partNames matching TPart
  public readonly meshes: Array<ColoredMesh> = []

  constructor(
    partGeoms: CompositeGeometry<TPart>,
    public readonly n: number,
  ) {
    let name: TPart
    for (name in partGeoms) {
      const mesh = new ColoredMesh(
        partGeoms[name],
        new MeshBasicMaterial({ color: 0xffffff }),
        n,
      )
      this.meshes.push(mesh)
    }
  }

  setInstanceStyle(index: number, style: CompositeStyle<TPart>) {
    this.partNames.forEach((name, meshIndex) => {
      this.meshes[meshIndex].setInstanceColor(index, style[name])
    })
  }

  // setInstanceColor(index: number, color: Color) {
  //   for (const im of this._meshes) {
  //     im.setInstanceColor(index, color)
  //   }
  // }

  setMatrixAt(index: number, matrix: Matrix4) {
    for (const mesh of this.meshes) {
      mesh.setMatrixAt(index, matrix)
    }
  }

  queueUpdate() {
    for (const mesh of this.meshes) {
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true
      }
      mesh.frustumCulled = false
    }
  }

  get count() {
    return this.meshes[0].count
  }

  set count(c: number) {
    for (const mesh of this.meshes) {
      mesh.count = c
    }
  }
}
