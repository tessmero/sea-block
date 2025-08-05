/**
 * @file mesh-asset-loader.ts
 *
 * Helper functions to preload and then lookup 3D model assets.
 */

import type { Group } from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

// find public/obj -type f | sed 's|^public/obj/||;s|$|\",|;s|^|\"|'
export const MESH_ASSET_URLS = [

  'kenney/chest.obj',

  'chess/bishop.obj',
  'chess/king.obj',
  'chess/knight.obj',
  'chess/pawn.obj',
  'chess/queen.obj',
  'chess/rook.obj',
] as const
export type MeshAssetUrl = (typeof MESH_ASSET_URLS)[number]

const loader = new OBJLoader()
const cache = new Map<MeshAssetUrl, Group>()

// get preloaded image
export function getMesh(url: MeshAssetUrl): Group {
  return cache.get(url) as Group
}

// called on startup
export async function loadAllMeshes(): Promise<void> {
  await Promise.all(
    MESH_ASSET_URLS.map(async (key) => {
      const fullUrl = `obj/${key}`
      const group = await loader.loadAsync(fullUrl)
      cache.set(key, group)
      // console.log('loaded mesh asset: ', key)
    }),
  )
}
