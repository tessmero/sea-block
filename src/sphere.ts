import { BoxTerrain } from './box-terrain'
import { Vector, add, multiply } from './vector'
import {
  GRAVITY,
  AIR_RESISTANCE,
  STEP_DURATION,
  RESTITUTION,
  SPHERE_RADIUS,
  SPHERE_COHESION,
  SPHERE_STIFFNESS,
  SPHERE_DAMPING,
  BUOYANT_FORCE,
  PRESSURE_FORCE,
  COLLISION_KERNEL_RADIUS,
} from './settings'

export class Sphere {
  position: Vector
  velocity: Vector
  color: string = 'white'

  private buoyantForce: number

  constructor(params: { position: Vector, velocity: Vector }) {
    this.position = { ...params.position }
    this.velocity = { ...params.velocity }
  }

  getPosition(): Vector {
    return this.position
  }

  setPosition(position: Vector) {
    this.position = { ...position }
  }

  step(boxTerrain: BoxTerrain) {
    // Apply gravity and air resistance
    this.velocity = add(this.velocity, GRAVITY)
    this.velocity = multiply(this.velocity, 1 - AIR_RESISTANCE)

    // Predict next position
    const futurePosition = add(this.position, multiply(this.velocity, STEP_DURATION))

    // Collide with terrain
    this._collideWithTerrain(boxTerrain, futurePosition)

    // Move to next position
    this.position = add(this.position, multiply(this.velocity, STEP_DURATION))
  }

  /** Spiral kernel offsets, e.g. for a 3x3 kernel: */
  static readonly spiralKernel: Array<{ dx: number, dz: number }> = (() => {
    // Generates a spiral order for a square kernel of given radius
    const radius = COLLISION_KERNEL_RADIUS
    const result: Array<{ dx: number, dz: number }> = []
    let x = 0, z = 0, dx = 0, dz = -1
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

  private _collideWithTerrain(boxTerrain: BoxTerrain, futurePosition: Vector) {
    const config = boxTerrain.config
    const { tileX, tileZ } = config.positionToCoord(futurePosition.x, futurePosition.z)

    for (const { dx, dz } of Sphere.spiralKernel) {
      const nx = tileX + dx
      const nz = tileZ + dz

      // Get box position and scale from instance matrix
      const idx = config.xzToIndex(nx, nz)
      if (idx === -1) continue // out of bounds
      const box = boxTerrain.getCollisionBoxAtIndex(idx)

      const collision = checkBoxSphereCollision(box, { position: futurePosition, radius: SPHERE_RADIUS })
      if (collision) {
        if (box.isWaterTile) {
          // apply upward buoyancy force
          this.velocity.y += BUOYANT_FORCE

          // apply downward pressure to the tile
          if (boxTerrain.physicsTiles) {
            boxTerrain.physicsTiles.accelTile(idx, PRESSURE_FORCE)
          }
        }
        else {
          // Adjust sphere position and velocity based on collision normal
          this.position = collision.adjustedPosition

          // Reflect velocity along the collision normal
          const vDotN = this.velocity.x * collision.normal.x + this.velocity.y * collision.normal.y + this.velocity.z * collision.normal.z

          const dvx = -(1 + RESTITUTION) * vDotN * collision.normal.x
          const dvy = -(1 + RESTITUTION) * vDotN * collision.normal.y
          const dvz = -(1 + RESTITUTION) * vDotN * collision.normal.z

          // this.velocity.x += dvx
          // this.velocity.y += dvy
          // this.velocity.z += dvz

          this.velocity = {
            x: this.velocity.x + dvx,
            y: this.velocity.y + dvy,
            z: this.velocity.z + dvz,
          }

          // // Set box color to match this sphere's color
          // if (boxTerrain.setInstanceColor) {
          //   boxTerrain.setInstanceColor(idx, this.color)
          // }

          // return // max one rigid collision per step
        }
      }
    }
  }

  collideSphere(neighbor: Sphere) {
    const dx = neighbor.position.x - this.position.x
    const dy = neighbor.position.y - this.position.y
    const dz = neighbor.position.z - this.position.z
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

      const rvx = neighbor.velocity.x - this.velocity.x
      const rvy = neighbor.velocity.y - this.velocity.y
      const rvz = neighbor.velocity.z - this.velocity.z
      const relVelAlongNormal = rvx * nx + rvy * ny + rvz * nz
      const dampingForce = -SPHERE_DAMPING * relVelAlongNormal

      const totalForce = springForce + dampingForce
      this.velocity.x -= nx * totalForce
      this.velocity.y -= ny * totalForce
      this.velocity.z -= nz * totalForce
      neighbor.velocity.x += nx * totalForce
      neighbor.velocity.y += ny * totalForce
      neighbor.velocity.z += nz * totalForce
    }
  }
}
// ...existing code...

function checkBoxSphereCollision(
  box: { center: Vector, dimensions: Vector, normal?: Vector },
  sphereObj: { position: Vector, radius: number },
): { normal: Vector, adjustedPosition: Vector, centerOutside: boolean } | null {
  const b = {
    minX: box.center.x - box.dimensions.x / 2,
    maxX: box.center.x + box.dimensions.x / 2,
    minY: box.center.y - box.dimensions.y / 2,
    maxY: box.center.y + box.dimensions.y / 2,
    minZ: box.center.z - box.dimensions.z / 2,
    maxZ: box.center.z + box.dimensions.z / 2,
  }
  const sphere = sphereObj.position
  const r = sphereObj.radius

  // Find closest point on box to sphere
  const closestX = Math.max(b.minX, Math.min(sphere.x, b.maxX))
  const closestY = Math.max(b.minY, Math.min(sphere.y, b.maxY))
  const closestZ = Math.max(b.minZ, Math.min(sphere.z, b.maxZ))

  // Calculate distance components
  const dx = sphere.x - closestX
  const dy = sphere.y - closestY
  const dz = sphere.z - closestZ
  const distanceSq = dx * dx + dy * dy + dz * dz

  if (distanceSq > r * r) return null

  // Use box normal if available, otherwise geometric normal
  let normal: Vector
  if (box.normal) {
    normal = { ...box.normal }
  }
  else {
    const distance = Math.sqrt(distanceSq)
    normal = {
      x: dx / distance || 0,
      y: dy / distance || 0,
      z: dz / distance || 0,
    }
  }

  // Calculate adjusted position
  let adjustedPosition: Vector
  const distance = Math.sqrt(distanceSq)
  const centerOutside = (distance > 0)
  if (centerOutside) {
    // Move out along the normal by (radius - penetration depth)
    const penetration = r - distance
    adjustedPosition = {
      x: sphere.x + normal.x * penetration,
      y: sphere.y + normal.y * penetration,
      z: sphere.z + normal.z * penetration,
    }
  }
  else {
    // Sphere center is inside box; pick the direction of max penetration axis
    const dists = [
      Math.abs(sphere.x - b.minX),
      Math.abs(sphere.x - b.maxX),
      Math.abs(sphere.y - b.minY),
      Math.abs(sphere.y - b.maxY),
      Math.abs(sphere.z - b.minZ),
      Math.abs(sphere.z - b.maxZ),
    ]
    const minDist = Math.min(...dists)
    const axis = dists.indexOf(minDist)
    adjustedPosition = { ...sphere }
    if (axis === 0) adjustedPosition.x = b.minX - r
    else if (axis === 1) adjustedPosition.x = b.maxX + r
    else if (axis === 2) adjustedPosition.y = b.minY - r
    else if (axis === 3) adjustedPosition.y = b.maxY + r
    else if (axis === 4) adjustedPosition.z = b.minZ - r
    else if (axis === 5) adjustedPosition.z = b.maxZ + r
  }

  return { normal, adjustedPosition, centerOutside }
}
