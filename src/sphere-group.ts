import * as THREE from 'three'
import { InstancedGroup } from './instanced-group'
import { Sphere } from './sphere'
import { SPHERE_RADIUS } from './settings'
import { BoxTerrain } from './box-terrain'

export class SphereGroup extends InstancedGroup {
  public spheres: Sphere[] = []

  public terrain: BoxTerrain | null = null

  constructor(
    public count: number,
  ) {
    super({
      count: count,
      geometry: new THREE.SphereGeometry(SPHERE_RADIUS, 16, 16),
      material: new THREE.MeshLambertMaterial({ color: 0xffffff }),
    })
  }

  protected buildInstances() {
    // all start invisible
    const dummy = new THREE.Object3D()
    dummy.scale.set(0, 0, 0)
    dummy.updateMatrix()
    for (let i = 0; i < this.count; i++) {
      this.mesh.setMatrixAt(i, dummy.matrix)
    }
  }

  addSphere(sphere: Sphere): number {
    if (this.spheres.length >= this.count) return -1
    this.spheres.push(sphere)
    return this.spheres.length - 1
  }

  step() {
    // collide spheres with terrain
    if (this.terrain) {
      for (const sphere of this.spheres) {
        if (sphere.position.y > -1000) {
          sphere.step(this.terrain)
        }
      }
    }

    // collide spheres with each other
    for (let a = 0; a < this.spheres.length; a++) {
      for (let b = a + 1; b < this.spheres.length; b++) {
        const sphereA = this.spheres[a]
        const sphereB = this.spheres[b]
        if (sphereA && sphereB) {
          sphereA.collideSphere(sphereB)
        }
      }
    }
  }

  updateMesh() {
    const dummy = new THREE.Object3D()
    dummy.scale.set(1, 1, 1)

    for (let i = 0; i < this.count; i++) {
      const sphere = this.spheres[i]
      if (sphere) {
        dummy.position.set(sphere.position.x, sphere.position.y, sphere.position.z)
      }
      else {
        dummy.position.set(0, -9999, 0)
      }
      dummy.updateMatrix()
      this.mesh.setMatrixAt(i, dummy.matrix)
    }
    this.mesh.instanceMatrix.needsUpdate = true
  }
}
