/**
 * @file sphere-sim.ts
 *
 * Physics simulation for spheres that collide with terrain and other spheres.
 */
import { Simulation } from './simulation'
import { Sphere } from '../sphere'
import { Tile } from '../tile'
import { TileGroup } from '../groups/tile-group'
import { Vector3 } from 'three'
import { SPHERE_RADIUS, COLLISION_KERNEL_RADIUS } from '../settings'
import { STEP_DURATION } from '../settings'
import { PhysicsConfig } from '../configs/physics-config'
import { FlatConfigMap } from '../configs/config-view'

export class SphereSim extends Simulation<Sphere> {
  constructor(public readonly terrain: TileGroup, // the tiles to collide with
  ) {
    super()
  }

  step(spheres: Sphere[]) {
    // collide spheres with terrain
    if (this.terrain) {
      for (const sphere of spheres) {
        if (sphere.position.y > -1000) {
          sphereStep(
            sphere,
            this.terrain,
            this.flatConfig,
          ) // sphere-physics.js
        }
      }
    }

    // collide spheres with each other
    for (let a = 0; a < spheres.length; a++) {
      for (let b = a + 1; b < spheres.length; b++) {
        const sphereA = spheres[a]
        const sphereB = spheres[b]
        if (sphereA && sphereB) {
          collideSphereWithSphere(
            sphereA,
            sphereB,
            this.flatConfig,
          ) // sphere-physics.js
        }
      }
    }
  }
}

export function sphereStep(sphere: Sphere, tileGroup: TileGroup, params: FlatConfigMap<PhysicsConfig>) {
  const { GRAVITY, AIR_RESISTANCE } = params

  // Apply gravity and air resistance
  sphere.velocity.y -= GRAVITY
  sphere.velocity.multiplyScalar(1 - AIR_RESISTANCE)

  // Predict next position
  const futurePosition = sphere.position.clone().add(sphere.velocity.clone().multiplyScalar(STEP_DURATION))

  // Collide with terrain
  collideWithTerrain(
    sphere,
    tileGroup,
    futurePosition,
    params,
  )

  // Move to next position
  sphere.position = sphere.position.add(sphere.velocity.clone().multiplyScalar(STEP_DURATION))
}

export function collideSphereWithSphere(self: Sphere, neighbor: Sphere, params: FlatConfigMap<PhysicsConfig>) {
  const { SPHERE_COHESION, SPHERE_STIFFNESS, SPHERE_DAMPING } = params
  const dx = neighbor.position.x - self.position.x
  const dy = neighbor.position.y - self.position.y
  const dz = neighbor.position.z - self.position.z
  const distSq = dx * dx + dy * dy + dz * dz

  if (distSq === 0) return

  const minDist = 2 * SPHERE_RADIUS
  if (distSq < minDist * minDist) {
    const restLength = minDist * (1 - SPHERE_COHESION)
    const dist = Math.sqrt(distSq)
    const displacement = restLength - dist
    const springForce = SPHERE_STIFFNESS * displacement

    const nx = dx / dist
    const ny = dy / dist
    const nz = dz / dist

    const rvx = neighbor.velocity.x - self.velocity.x
    const rvy = neighbor.velocity.y - self.velocity.y
    const rvz = neighbor.velocity.z - self.velocity.z
    const relVelAlongNormal = rvx * nx + rvy * ny + rvz * nz
    const dampingForce = -SPHERE_DAMPING * relVelAlongNormal

    const totalForce = springForce + dampingForce
    self.velocity.x -= nx * totalForce
    self.velocity.y -= ny * totalForce
    self.velocity.z -= nz * totalForce
    neighbor.velocity.x += nx * totalForce
    neighbor.velocity.y += ny * totalForce
    neighbor.velocity.z += nz * totalForce
  }
}

// Spiral kernel offsets, e.g. 5x5 grid spiraling outward from (0,0)
const spiralKernel: Array<{ dx: number
  dz: number }> = (() => {
  const radius = COLLISION_KERNEL_RADIUS
  const result: Array<{ dx: number
    dz: number }> = []
  let x = 0,
    z = 0,
    dx = 0,
    dz = -1
  const size = radius * 2 + 1
  const maxI = size * size
  for (let i = 0; i < maxI; i++) {
    if (Math.abs(x) <= radius && Math.abs(z) <= radius) {
      result.push({ dx: x, dz: z })
    }
    if (x === z || (x < 0 && x === -z) || (x > 0 && x === 1 - z)) {
      // Change direction
      [dx, dz] = [-dz, dx]
    }
    x += dx
    z += dz
  }
  return result
})()

function collideWithTerrain(self: Sphere, terrain: TileGroup, futurePosition: Vector3, params: FlatConfigMap<PhysicsConfig>) {
  const { BUOYANT_FORCE, PRESSURE_FORCE, RESTITUTION } = params

  const config = terrain.grid
  const { x: tileX, z: tileZ } = config.positionToCoord(
    futurePosition.x,
    futurePosition.z,
  )

  for (const { dx, dz } of spiralKernel) {
    const nx = tileX + dx
    const nz = tileZ + dz

    // Get box position and scale from instance matrix
    const idx = config.xzToIndex(
      nx,
      nz,
    ).i
    if (idx === -1) continue // out of bounds
    const tile = terrain.members[idx]

    const collision = checkBoxSphereCollision(
      tile,
      futurePosition,
    )
    if (collision) {
      if (tile.isWater) {
        // apply upward buoyancy force
        self.velocity.y += BUOYANT_FORCE

        // apply downward pressure to the tile
        terrain.sim.accelTile(
          idx,
          PRESSURE_FORCE,
        )
      }
      else {
        // Adjust sphere position and velocity based on collision normal
        self.position = collision.adjustedPosition

        // Reflect velocity along the collision normal
        const vDotN = self.velocity.x * collision.normal.x
          + self.velocity.y * collision.normal.y
          + self.velocity.z * collision.normal.z

        const dvx = -(1 + RESTITUTION) * vDotN * collision.normal.x
        const dvy = -(1 + RESTITUTION) * vDotN * collision.normal.y
        const dvz = -(1 + RESTITUTION) * vDotN * collision.normal.z

        /*
                 * this.velocity.x += dvx
                 * this.velocity.y += dvy
                 * this.velocity.z += dvz
                 */

        self.velocity.x += dvx
        self.velocity.y += dvy
        self.velocity.z += dvz

        // // Set box color to match this sphere's color
        // if (TileGroup.setInstanceColor) {
        //   TileGroup.setInstanceColor(idx, this.color)
        // }

        // return // max one rigid collision per step
      }
    }
  }
}

function checkBoxSphereCollision(
  tile: Tile,
  sphere: Vector3,
): { normal: Vector3
  adjustedPosition: Vector3
  centerOutside: boolean } | null {
  const { x, z } = tile.position
  const height = tile.height
  const y = height / 2

  const xzRad = 2

  const minX = x - xzRad
  const maxX = x + xzRad
  const minY = y - height / 2
  const maxY = y + height / 2
  const minZ = z - xzRad
  const maxZ = z + xzRad
  const r = SPHERE_RADIUS

  // Find closest point on box to sphere
  const closestX = Math.max(minX, Math.min(sphere.x, maxX))
  const closestY = Math.max(minY, Math.min(sphere.y, maxY))
  const closestZ = Math.max(minZ, Math.min(sphere.z, maxZ))

  // Calculate distance components
  const dx = sphere.x - closestX
  const dy = sphere.y - closestY
  const dz = sphere.z - closestZ
  const distanceSq = dx * dx + dy * dy + dz * dz

  if (distanceSq > r * r) return null

  const normal = tile.normal
  // // Use box normal if available, otherwise geometric normal
  // let normal: Vector3
  // if (tile.normal) {
  //   normal = tile.normal
  // }
  // else {
  //   const distance = Math.sqrt(distanceSq)
  //   normal = new Vector3(
  //     dx / distance || 0,
  //     dy / distance || 0,
  //     dz / distance || 0,
  //   )
  // }

  // Calculate adjusted position
  let adjustedPosition: Vector3
  const distance = Math.sqrt(distanceSq)
  const centerOutside = distance > 0
  if (centerOutside) {
    // Move out along the normal by (radius - penetration depth)
    const penetration = r - distance
    adjustedPosition = new Vector3(
      sphere.x + normal.x * penetration,
      sphere.y + normal.y * penetration,
      sphere.z + normal.z * penetration,
    )
  }
  else {
    // Sphere center is inside box; pick the direction of max penetration axis
    const dists = [
      Math.abs(sphere.x - minX),
      Math.abs(sphere.x - maxX),
      Math.abs(sphere.y - minY),
      Math.abs(sphere.y - maxY),
      Math.abs(sphere.z - minZ),
      Math.abs(sphere.z - maxZ),
    ]
    const minDist = Math.min(...dists)
    const axis = dists.indexOf(minDist)

    adjustedPosition = sphere.clone()
    if (axis === 0) adjustedPosition.x = minX - r
    else if (axis === 1) adjustedPosition.x = maxX + r
    else if (axis === 2) adjustedPosition.y = minY - r
    else if (axis === 3) adjustedPosition.y = maxY + r
    else if (axis === 4) adjustedPosition.z = minZ - r
    else if (axis === 5) adjustedPosition.z = maxZ + r
  }

  return { normal,
    adjustedPosition,
    centerOutside }
}
