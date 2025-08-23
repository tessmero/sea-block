/**
 * @file sphere-group.ts
 *
 * Contains an array of Sphere instances and their meshes.
 */
import * as THREE from 'three'
import { Vector3 } from 'three'
import type { Sphere } from '../sphere'
import { SphereSim } from '../physics/sphere-sim'
import { SPHERE_RADIUS } from '../../settings'
import type { TileGroup } from '../groups/tile-group'
import { Group, InstancedMember } from './group'

// sphere that references position in instanced mesh
class SphereIm extends InstancedMember implements Sphere {
  public readonly velocity = new Vector3(0, 0, 0)
  public isGhost = true
  public isVisible = false
  public isFish = false
  public scalePressure = 1
}

export class SphereGroup extends Group<Sphere, SphereSim> {
  public terrain: TileGroup | null = null

  constructor(
    public n: number,
    terrain: TileGroup,
  ) {
    super({
      sim: new SphereSim(terrain),
      subgroups: [{
        n,
        geometry: new THREE.SphereGeometry(SPHERE_RADIUS, 16, 16),
        // material: new THREE.MeshLambertMaterial({ color: 0xffffff }),
      }],

      // one subgroup with indices matching group member indices
      subgroupsByFlatIndex: Array.from({ length: n }, (_, i) => i).map(i => ({
        subgroupIndex: 0,
        indexInSubgroup: i,
      })),
    })
  }

  protected buildMembers(): Array<Sphere> {
    // all start invisible
    // const dummy = new THREE.Object3D()
    // dummy.scale.set(0, 0, 0)
    // dummy.updateMatrix()
    const result: Array<Sphere> = []
    // for (let i = 0; i < this.n; i++) {
    //   this.mesh.setMatrixAt(i, dummy.matrix)
    // }

    /*
         * const testPositions = Array.from({ length: 5 }, () => new THREE.Vector3(
         *   (Math.random() - 0.5) * 20,
         *   15 + Math.random() * 5,
         *   (Math.random() - 0.5) * 20,
         * ))
         */

    const spherePositions = Array.from({ length: this.n },
      (_, i) => new Vector3(0, i * 10, 0))

    // give spheres unique colors
    const sphereColors = Array.from(
      { length: this.n },
      (_, i) => new THREE.Color().setHSL(i / 10, 0.8, 0.5),
    )
    for (let i = 0; i < spherePositions.length; i++) {
      const sphere = new SphereIm(
        i, // index in group
        this.subgroups[0], // only one subgroup
        i, // index in subgroup
      )
      sphere.position = spherePositions[i]
      result.push(sphere)
      this.setInstanceColor(i, sphereColors[i])
    }

    return result
  }

  updateMeshes() {
    for (let i = 0; i < this.n; i++) {
      const sphere = this.members[i]
      if (sphere) {
        dummy.position.set(
          sphere.position.x,
          sphere.position.y,
          sphere.position.z,
        )

        if (sphere.isVisible) {
          dummy.scale.set(1, 1, 1)
        }
        else {
          // dummy.scale.set(1, 1, 1)
          dummy.scale.set(0, 0, 0)
        }
      }
      else {
        dummy.position.set(0, -9999, 0)
      }
      dummy.updateMatrix()
      this.setMemberMatrix(i, dummy.matrix)
    }
  }
}

const dummy = new THREE.Object3D()
