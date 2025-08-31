/**
 * @file mesh-asset-loader.ts
 *
 * Helper functions to preload and then lookup 3D model assets.
 */

import type { Group } from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MESH_ASSET_URLS, type MeshAssetUrl } from './mesh-asset-urls'

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
