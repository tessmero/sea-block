/**
 * @file aabb-raycaster.ts
 *
 * Cast rays against grid-alligned boxes. Perfect picking square terrain tiles.
 * Acts as a fast approximation for non-square tilings.
 */

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { TileGroup } from 'core/groups/tile-group'
import type { Raycaster } from 'three'
import { Vector3 } from 'three'

const dirFrac = new Vector3()
const min = new Vector3()
const max = new Vector3()

/**
 * Cast a ray against terrain tiles (AABB) and return the first intersected TileIndex.
 * Optimized by precomputing dirFrac.
 */
export function pickAabbTile(raycaster: Raycaster, terrain: TileGroup): TileIndex | undefined {
  const ray = raycaster.ray
  // Precompute reciprocal direction for slab method
  dirFrac.set(
    1.0 / ray.direction.x,
    1.0 / ray.direction.y,
    1.0 / ray.direction.z,
  )

  let closestT = Infinity
  let closestIdx: TileIndex | undefined = undefined

  // Iterate all terrain tiles
  for (const idx of terrain.grid.tileIndices) {
    const tile = terrain.members[idx.i]
    // Get tile position and height
    const pos = terrain.tilePositions[idx.i]
    const h = tile.height || 1
    // AABB bounds (assuming square tile centered at pos.x, pos.z)
    const halfSize = 0.5
    min.set(pos.x - halfSize, 0, pos.z - halfSize)
    max.set(pos.x + halfSize, h, pos.z + halfSize)

    // Ray-AABB intersection
    const t1 = (min.x - ray.origin.x) * dirFrac.x
    const t2 = (max.x - ray.origin.x) * dirFrac.x
    const t3 = (min.y - ray.origin.y) * dirFrac.y
    const t4 = (max.y - ray.origin.y) * dirFrac.y
    const t5 = (min.z - ray.origin.z) * dirFrac.z
    const t6 = (max.z - ray.origin.z) * dirFrac.z

    const tmin = Math.max(
      Math.max(Math.min(t1, t2), Math.min(t3, t4)),
      Math.min(t5, t6),
    )
    const tmax = Math.min(
      Math.min(Math.max(t1, t2), Math.max(t3, t4)),
      Math.max(t5, t6),
    )

    // Ray misses or is behind box
    if (tmax < 0 || tmin > tmax) continue
    // Find closest intersection
    if (tmin >= 0 && tmin < closestT) {
      closestT = tmin
      closestIdx = idx
    }
  }
  return closestIdx
}
