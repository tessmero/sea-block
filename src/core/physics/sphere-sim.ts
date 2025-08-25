/**
 * @file sphere-sim.ts
 *
 * Physics simulation for spheres that collide with terrain and other spheres.
 */
import { Vector3 } from 'three'
import type { Sphere } from '../sphere'
import type { Tile } from '../tile'
import type { TileGroup } from '../groups/tile-group'
import { SPHERE_RADIUS, COLLISION_KERNEL_RADIUS } from '../../settings'
import { STEP_DURATION } from '../../settings'
import { physicsConfig } from '../../configs/imp/physics-config'
import type { FlatConfigMap } from '../../configs/configurable'
import { Simulation } from './simulation'

type PhysParams = FlatConfigMap<typeof physicsConfig.tree>

export class SphereSim extends Simulation<Sphere> {
  constructor(public readonly terrain: TileGroup, // the tiles to collide with
  ) {
    super()
  }

  step(spheres: Array<Sphere>) {
    // collide spheres with terrain
    if (this.terrain) {
      for (const sphere of spheres) {
        if (sphere.position.y > -1000) {
          sphereStep(
            sphere,
            this.terrain,
            physicsConfig.flatConfig,
          ) // sphere-physics.js
        }
      }
    }

    // collide spheres with each other
    for (let a = 0; a < spheres.length; a++) {
      const sphereA = spheres[a]
      if (!sphereA || sphereA.isGhost) {
        // console.log('skip ghost sphere at index', a)
        continue
      }
      for (let b = a + 1; b < spheres.length; b++) {
        const sphereB = spheres[b]
        if (!sphereB || sphereB.isGhost) {
        // console.log('skip ghost sphere at index', b)
          continue
        }
        collideSphereWithSphere(
          sphereA,
          sphereB,
          physicsConfig.flatConfig,
        )
      }
    }
  }
}

const positionDelta = new Vector3()
const futurePosition = new Vector3()

function sphereStep(sphere: Sphere, tileGroup: TileGroup, params: PhysParams) {
  const { GRAVITY, AIR_RESISTANCE } = params

  // Apply gravity and air resistance
  if (!sphere.isGhost) sphere.velocity.y -= GRAVITY
  if (sphere.isGhost) {
    // hack to make camera anchor sphere have higher friction
    sphere.velocity.multiplyScalar(1 - (AIR_RESISTANCE * 5))
  }
  else {
    sphere.velocity.multiplyScalar(1 - AIR_RESISTANCE)
  }

  // Predict next position
  positionDelta.copy(sphere.velocity).multiplyScalar(STEP_DURATION)
  futurePosition.copy(sphere.position).add(positionDelta)
  // const futurePosition = sphere.position.clone().add(sphere.velocity.clone().multiplyScalar(STEP_DURATION))

  if (sphere.isGhost) {
    // ghosts just move to tile height
    const { x, z } = tileGroup.grid.positionToCoord(sphere.position.x, sphere.position.z)
    const idx = tileGroup.grid.xzToIndex(x, z)
    if (idx) {
      const height = tileGroup.members[idx.i].height
      futurePosition.y = height
    }
    sphere.velocity.y = 0
  }
  else {
    // Collide with land and water
    collideWithTerrain(
      sphere,
      tileGroup,
      futurePosition,
      params,
    )
  }

  // Move to next position
  sphere.position = sphere.position.add(positionDelta)
}

function collideSphereWithSphere(
  self: Sphere, neighbor: Sphere, params: PhysParams): void {
  const { SPHERE_COHESION, SPHERE_STIFFNESS, SPHERE_DAMPING } = params
  const dx = neighbor.position.x - self.position.x
  const dy = neighbor.position.y - self.position.y
  const dz = neighbor.position.z - self.position.z
  const distSq = dx * dx + dy * dy + dz * dz

  if (distSq === 0) return // same position, give up

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

function collideWithTerrain(
  self: Sphere, terrain: TileGroup, futurePosition: Vector3, params: PhysParams,
) {
  const { BUOYANT_FORCE, PRESSURE_FORCE, RESTITUTION } = params

  const grid = terrain.grid
  const { x: tileX, z: tileZ } = grid.positionToCoord(
    futurePosition.x,
    futurePosition.z,
  )

  for (const { dx, dz } of spiralKernel) {
    const nx = tileX + dx
    const nz = tileZ + dz

    // Get box position and scale from instance matrix
    const idx = grid.xzToIndex(nx, nz)
    if (!idx) continue // out of bounds
    const tile = terrain.members[idx.i]

    const collision = checkBoxSphereCollision(
      tile,
      futurePosition,
    )
    if (collision) {
      if (tile.isWater) {
        // apply upward buoyancy force
        self.velocity.y += BUOYANT_FORCE

        // apply downward pressure to the tile
        terrain.sim.accelTile(idx, PRESSURE_FORCE * self.scalePressure)
      }
      else if (!self.isFish) {
        // non-fish, non-ghost sphere colliding with solid terrain

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

type BoxCollision = {
  normal: Vector3
  adjustedPosition: Vector3
  isCenterOutside: boolean
}

const adjustedPosition = new Vector3()

function checkBoxSphereCollision(
  tile: Tile,
  sphere: Vector3,
): BoxCollision | null {
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
  const distance = Math.sqrt(distanceSq)
  const isCenterOutside = distance > 0
  if (isCenterOutside) {
    // Move out along the normal by (radius - penetration depth)
    const penetration = r - distance
    adjustedPosition.set(
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

    adjustedPosition.copy(sphere)
    if (axis === 0) adjustedPosition.x = minX - r
    else if (axis === 1) adjustedPosition.x = maxX + r
    else if (axis === 2) adjustedPosition.y = minY - r
    else if (axis === 3) adjustedPosition.y = maxY + r
    else if (axis === 4) adjustedPosition.z = minZ - r
    else if (axis === 5) adjustedPosition.z = maxZ + r
  }

  return { normal,
    adjustedPosition,
    isCenterOutside }
}
