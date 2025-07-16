/**
 * @file flora-group.ts
 *
 * Additional meshes on top of tiles,
 * representing trees/grass/flowers.
 */
import * as THREE from 'three'
import type { SeaBlock } from '../../sea-block'
import { FloraSim } from '../physics/flora-sim'
import type { Tile } from '../tile'
import { FloraGroupGfxHelper } from '../../gfx/3d/flora-group-gfx-helper'
import type { TiledGrid } from '../grid-logic/tiled-grid'
import type { ColoredInstancedMesh } from '../../gfx/3d/colored-instanced-mesh'
import { Group } from './group'
import type { TileGroup } from './tile-group'

export class FloraGroup extends Group<Tile, FloraSim> {
  public readonly gfxHelper: FloraGroupGfxHelper

  public readonly grid: TiledGrid

  constructor(
    public readonly terrain: TileGroup,
  ) {
    const n = terrain.grid.n

    super({
      sim: new FloraSim(terrain.grid),
      subgroups: [{
        n,
        geometry: new THREE.CircleGeometry(0.5, 4).rotateZ(Math.PI / 4),
        // material: new THREE.MeshLambertMaterial({ color: 0xffffff }),
      }],

      // one subgroup with indices matching group member indices
      subgroupsByFlatIndex: Array.from({ length: n }, (_, i) => i).map(i => ({
        subgroupIndex: 0,
        indexInSubgroup: i,
      })),
    })

    const cim = this.subgroups[0].mesh as ColoredInstancedMesh
    const colorAll = new THREE.Color(0x55ff77)
    for (let i = 0; i < n; i++) {
      cim.setInstanceColor(i, colorAll)
    }

    this.grid = terrain.grid
    this.gfxHelper = new FloraGroupGfxHelper(this)
  }

  protected buildMembers(): Array<Tile> {
    return this.terrain.members
  }

  protected updateMeshes(seaBlock: SeaBlock): void {
    this.gfxHelper.updateFloraMeshes(seaBlock)
  }
}
