/**
 * @file tile-mesh.ts
 *
 * Used to render groups of tiles as two instanced meshes (tops and sides).
 */

import type { Matrix4, TypedArray } from 'three'
import { CircleGeometry, CylinderGeometry, MeshBasicMaterial, Vector3 } from 'three'
import type { TileGroup } from '../groups/tile-group'
import type { Subgroup } from '../groups/subgroup'
import type { TileShape } from '../grid-logic/tilings/tiling'
import { ColoredMesh } from './colored-mesh'
import type { TileStyle } from './styles/style'

// extruded tile shape to render
export interface TileExt {
  top: CircleGeometry // flat polygon top
  sides: CylinderGeometry // open prism sides
}

export function extrude(shape: TileShape): TileExt {
  // return cap and tube geometry for each tile shape
  const { n, radius, angle } = shape
  return {
    // // // regular polygon on top face
    top: new CircleGeometry(radius, n)
      .rotateX(-Math.PI / 2) // align with xz plane facing up
      .rotateY(angle - Math.PI / 2)// angle of tile in grid
      .translate(0, 0.5, 0), // on top of tube

    // open-ended prism side faces
    sides: new CylinderGeometry(
      radius, // size
      radius, // size
      1, // height
      n, // radial segments
      1, // height segments
      true, // open-ended
    ).rotateY(angle), // angle of tile in grid

  }
}

export class TileMesh {
  public readonly _names: Array<keyof TileStyle> = []
  public readonly _meshes: Array<ColoredMesh> = []
  constructor(
    private readonly ext: TileExt,
    private readonly n: number,
  ) {
    let name: keyof TileExt
    for (name in ext) {
      const mesh = new ColoredMesh(
        ext[name],
        new MeshBasicMaterial({ color: 0xffffff }),
        n,
      )
      this._names.push(name)
      this._meshes.push(mesh)
    }
  }

  setTileStyle(index: number, tileStyle: TileStyle) {
    this._names.forEach((name, meshIndex) => {
      this._meshes[meshIndex].setInstanceColor(index, tileStyle[name])
    })
  }

  // setInstanceColor(index: number, color: Color) {
  //   for (const im of this._meshes) {
  //     im.setInstanceColor(index, color)
  //   }
  // }

  setMatrixAt(index: number, matrix: Matrix4) {
    for (const mesh of this._meshes) {
      mesh.setMatrixAt(index, matrix)
    }
  }

  queueUpdate() {
    for (const mesh of this._meshes) {
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true
      }
      mesh.frustumCulled = false
    }
  }

  get count() {
    return this._meshes[0].count
  }

  set count(c: number) {
    for (const mesh of this._meshes) {
      mesh.count = c
    }
  }
}

// helper to build members that refer to position in instanced mesh
export class TileMeshIm {
  private readonly parent: TileMesh

  private static readonly positionDummy = new Vector3()

  constructor(
    protected readonly index: number,
    protected readonly group: TileGroup,
    protected readonly subgroup: Subgroup,
  ) {}

  get posArrays(): Array<TypedArray> {
    const [subgroup, _indexInSubgroup] = this.group.subgroupsByFlatIndex[this.index]

    if (!(subgroup.mesh instanceof TileMesh)) {
      throw new Error(`invalid subgroup. mesh has type ${subgroup.mesh.constructor.name}`)
    }

    return subgroup.mesh._meshes.map(m => m.instanceMatrix.array)
  }

  get offset() {
    const [subgroup, indexInSubgroup] = this.group.subgroupsByFlatIndex[this.index]

    if (subgroup !== this.subgroup) {
      throw new Error('subgroup changed')
    }

    // start of position in meshes arrays
    return indexInSubgroup * 16 + 12
  }

  get y(): number {
    return this.posArrays[0][this.offset + 1]
  }

  get position() {
    // get position from one representative
    const posArray = this.posArrays[0]
    let { offset } = this
    TileMeshIm.positionDummy.set(
      posArray[offset++],
      posArray[offset++],
      posArray[offset++],
    )
    return TileMeshIm.positionDummy
  }

  set position(pos: Vector3) {
    // set position in all instnacedmeshes
    for (const posArray of this.posArrays) {
      let { offset } = this
      posArray[offset++] = pos.x
      posArray[offset++] = pos.y
      posArray[offset++] = pos.z
    }
  }
}
