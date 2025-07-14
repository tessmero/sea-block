/**
 * @file tile-mesh.ts
 *
 * Wraps a pair of colored meshes (tops and sides) used to render tiles.
 */

import type { TypedArray } from 'three'
import { CircleGeometry, CylinderGeometry, Vector3 } from 'three'
import type { TileGroup } from '../../groups/tile-group'
import type { Subgroup } from '../../groups/subgroup'
import type { TileShape } from '../../grid-logic/tilings/tiling'

import { CompositeInstancedMesh, type CompositeGeometry } from './composite-mesh'

// enum
export const TILE_PARTS = ['top', 'sides'] as const
export type TilePart = (typeof TILE_PARTS)[number]

// extruded tile shape to render in two parts
export interface TileGeom extends CompositeGeometry<TilePart> {
  top: CircleGeometry // flat polygon top
  sides: CylinderGeometry // open prism sides
}

// pair of colored instanced meshes
export class TileMesh extends CompositeInstancedMesh<TilePart> {
  partNames = TILE_PARTS
}

// helper to extrude flat tile polygon
export function extrude(shape: TileShape): TileGeom {
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

// helper to build members that refer to position in instanced mesh
export class TileMeshIm {
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

    return subgroup.mesh.meshes.map(m => m.instanceMatrix.array)
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
