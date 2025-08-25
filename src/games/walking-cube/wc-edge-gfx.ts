/**
 * @file wc-edge-gfx.ts
 *
 * Build box wireframes out of sets of 12 rod-like boxes.
 */
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js'
import type { BufferGeometry } from 'three'
import { Box3, Vector3 } from 'three'
import { BoxGeometry } from 'three'

// 1x1x1 box centered at 0,0,0
const defaultBox = new Box3(
  new Vector3(-0.5, -0.5, -0.5),
  new Vector3(0.5, 0.5, 0.5),
)

type Params = {
  box?: Box3
  thickness?: number
}

export function buildBoxEdges(params?: Params): BufferGeometry {
  const {
    box = defaultBox,
    thickness = 0.1,
  } = params ?? {}

  const v = getBoxVerts(box)
  const geometries = edges.map(([i, j]) => createRodGeometry(v[i], v[j], thickness))
  const merged = BufferGeometryUtils.mergeGeometries(geometries, false)
  merged.deleteAttribute('normal')
  merged.deleteAttribute('uv')
  return merged
}

function getBoxVerts(box: Box3): Array<[number, number, number]> {
  const min = box.min, max = box.max
  return [
    [min.x, min.y, min.z],
    [max.x, min.y, min.z],
    [max.x, max.y, min.z],
    [min.x, max.y, min.z],
    [min.x, min.y, max.z],
    [max.x, min.y, max.z],
    [max.x, max.y, max.z],
    [min.x, max.y, max.z],
  ]
}
// 12 edges as pairs of vertex indices
const edges: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 0], // bottom
  [4, 5], [5, 6], [6, 7], [7, 4], // top
  [0, 4], [1, 5], [2, 6], [3, 7], // sides
]

function createRodGeometry(
  p1: [number, number, number],
  p2: [number, number, number],
  thickness: number,
): BufferGeometry {
  const dx = p2[0] - p1[0]
  const dy = p2[1] - p1[1]
  const dz = p2[2] - p1[2]
  const len = 1 + thickness
  const geom = new BoxGeometry(
    Math.abs(dx) > 0 ? len : thickness,
    Math.abs(dy) > 0 ? len : thickness,
    Math.abs(dz) > 0 ? len : thickness,
  )
  // Center at midpoint
  const mx = (p1[0] + p2[0]) / 2
  const my = (p1[1] + p2[1]) / 2
  const mz = (p1[2] + p2[2]) / 2
  geom.translate(mx, my, mz)
  return geom
}
