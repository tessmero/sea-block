/**
 * @file raft-physics.ts
 *
 * Simulate floating raft as 4 spheres connected by springs.
 */

import type { Sphere } from 'core/sphere'
import type { SeaBlock } from 'sea-block'
import type { Object3D } from 'three'
import { Matrix4, Vector3 } from 'three'

export function buildRaftRig(context: SeaBlock) {
  const spheres = context.sphereGroup.members.slice(2, 6)
  const center = context.orbitControls.target
  return new RaftRig(spheres, center)
}

const posDummy = new Vector3()
const velDummy = new Vector3()
const m4Dummy = new Matrix4()

type Spring = { i: number, j: number, restLength: number, k: number }

export class RaftRig {
  springs: Array<Spring> = []
  public applyForwardThrust(accelMag: number) {
    const diag1 = new Vector3().copy(this.spheres[2].position).sub(this.spheres[0].position)
    const forward = diag1.clone().normalize()
    for (const sphere of this.spheres) {
      sphere.velocity.add(forward.clone().multiplyScalar(accelMag))
    }
  }

  public getCameraTarget(target?: Vector3) {
    const writeTo = target ?? posDummy

    // center of raft
    writeTo.copy(this.spheres[0].position).lerp(this.spheres[2].position, 0.5)

    // ahead of raft
    velDummy.copy(this.spheres[0].velocity).lerp(this.spheres[2].velocity, 0.5)
    writeTo.addScaledVector(velDummy, 1e2)

    return writeTo
  }

  public applyTorque(torqueMag: number) {
    const up = new Vector3(0, 1, 0)
    const center = new Vector3(0, 0, 0)
    for (const sphere of this.spheres) center.add(sphere.position)
    center.multiplyScalar(1 / this.spheres.length)
    for (const sphere of this.spheres) {
      const r = new Vector3().copy(sphere.position).sub(center)
      const tangential = new Vector3().crossVectors(up, r).normalize()
      sphere.velocity.add(tangential.multiplyScalar(torqueMag))
    }
  }

  constructor(
    public readonly spheres: Array<Sphere>,
    center: Vector3,
  ) {
    if (spheres.length !== 4) {
      throw new Error('raft rig should have exactly 4 spheres')
    }

    const size = 4
    const half = size / 2
    const y = 14// center.y

    const positions = [
      { x: center.x - half, y, z: center.z - half },
      { x: center.x + half, y, z: center.z - half },
      { x: center.x + half, y, z: center.z + half },
      { x: center.x - half, y, z: center.z + half },
    ]
    for (let i = 0; i < 4; ++i) {
      posDummy.copy(positions[i])
      this.spheres[i].position = posDummy // SphereIm must set position with =
      this.spheres[i].velocity.set(0, 0, 0)
      this.spheres[i].isGhost = false
      this.spheres[i].isFish = false
      this.spheres[i].scalePressure = 0.1
    }

    // Build 6 springs (all pairs)
    const k = 1e-5 // spring constant
    for (let i = 0; i < 4; ++i) {
      for (let j = i + 1; j < 4; ++j) {
        const si = this.spheres[i]
        const sj = this.spheres[j]
        const restLength = posDummy.copy(si.position).distanceTo(sj.position)
        this.springs.push({ i, j, restLength, k })
      }
    }
  }

  public update(dt: number) {
    // update springs: simple spring force between each pair
    for (const spring of this.springs) {
      const a = this.spheres[spring.i]
      const b = this.spheres[spring.j]
      const delta = posDummy.copy(a.position).sub(b.position)
      const dist = delta.length()
      if (dist < 1e-6) continue
      const dir = delta.multiplyScalar(1 / dist)
      const forceMag = -spring.k * (dist - spring.restLength)
      // Apply force to velocities (F = m*a, assume m=1)
      const force = dir.multiplyScalar(forceMag * 0.5 * dt) // 0.5 to split between both
      a.velocity.add(force)
      b.velocity.sub(force)
    }
  }

  public alignMesh(mesh: Object3D) {
    // Compute center of mass of the 4 spheres
    const center = new Vector3(0, 0, 0)
    for (const sphere of this.spheres) {
      center.add(sphere.position)
    }
    center.multiplyScalar(1 / this.spheres.length)

    // Approximate raft orientation using diagonals
    // Use spheres 0 and 2 for one diagonal, 1 and 3 for the other
    const diag1 = new Vector3().copy(this.spheres[2].position).sub(this.spheres[0].position) // x axis
    const diag2 = new Vector3().copy(this.spheres[3].position).sub(this.spheres[1].position) // z axis

    // Create orthonormal basis: x = diag1, z = diag2, y = up
    const xAxis = diag1.clone().normalize()
    const zAxis = diag2.clone().normalize()
    const yAxis = new Vector3().crossVectors(zAxis, xAxis).normalize()
    // Re-orthogonalize z to ensure right-handed basis
    zAxis.crossVectors(xAxis, yAxis).normalize()

    // Build rotation matrix
    const m = m4Dummy
    m.makeBasis(xAxis, yAxis, zAxis)
    mesh.position.copy(center)
    mesh.quaternion.setFromRotationMatrix(m)
    // quatDummy.setFromRotationMatrix(m)
    // mesh.quaternion.slerp(quatDummy, .1)
  }
}

// const quatDummy = new Quaternion()
