/**
 * @file tile-mesh.ts
 *
 * Used to render groups of tiles as two instanced meshes (tops and sides).
 */

import { CircleGeometry, CylinderGeometry, Matrix4, MeshBasicMaterial, TypedArray, Vector3 } from 'three'
import { Subgroup } from '../groups/subgroup'
import { ColoredMesh } from './colored-mesh'
import { TileStyle } from './styles/style'
import { TILE_DILATE } from '../settings'

// extruded tile shape to render
export type TileExt = {
  top: CircleGeometry // flat polygon top
  sides: CylinderGeometry // open prism sides
}

export function extrude(shape): TileExt {
  // return cap and tube geometry for each tile shape
  const { n, radius, angle } = shape
  return {
    // // // regular polygon on top face
    top: new CircleGeometry(radius * (1 + TILE_DILATE), n)
      .rotateX(-Math.PI / 2) // align with xz plane facing up
      .rotateY(angle - Math.PI / 2)// angle of tile in grid
      .translate(0, 0.5, 0), // on top of tube

    // open-ended prism side faces
    sides: new CylinderGeometry(
      radius * (1 + TILE_DILATE), // size
      radius * (1 + TILE_DILATE), // size
      1, // height
      n, // radial segments
      1, // height segments
      true, // open-ended
    ).rotateY(angle), // angle of tile in grid

  }
}

export class TileMesh {
  public readonly _names: string[] = []
  public readonly _meshes: ColoredMesh[] = []
  constructor(
    private readonly ext: TileExt,
    private readonly n: number,
  ) {
    for (const [name, geometry] of Object.entries(ext)) {
      const mesh = new ColoredMesh(
        geometry,
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
    for (const mesh of Object.values(this._meshes)) {
      mesh.instanceMatrix.needsUpdate = true
      mesh.instanceColor.needsUpdate = true
      mesh.frustumCulled = false
    }
  }
}

// helper to build members that refer to position in instanced mesh
export class TileMeshIm {
  private readonly parent: TileMesh

  private readonly offset: number

  private readonly posArrays: TypedArray[]
  private static readonly positionDummy = new Vector3()

  constructor(
    protected readonly index: number,
    subgroup: Subgroup,
    protected readonly indexInSubgroup: number,
  ) {
    if (!(subgroup.mesh instanceof TileMesh)) {
      throw new Error(`invalid subgroup. mesh has type ${subgroup.mesh.constructor.name}`)
    }
    this.parent = subgroup.mesh

    // pick one to read positions from from
    this.posArrays = this.parent._meshes.map(mesh => mesh.instanceMatrix.array)

    // start of position in meshes arrays
    this.offset = indexInSubgroup * 16 + 12
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
