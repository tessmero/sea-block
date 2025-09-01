/**
 * @file image-asset-loader.ts
 *
 * Helper functions to preload and then lookup image assets.
 */

import { IMAGE_ASSET_URLS, type ImageAssetUrl } from './image-asset-urls'
import { addToSpriteAtlas } from './sprite-atlas'

const cache = new Map<ImageAssetUrl, HTMLImageElement>()

// get preloaded image
export function getImage(url: ImageAssetUrl): HTMLImageElement {
  return cache.get(url) as HTMLImageElement
}

let didCallLoadAllImages = false

// called on startup
export async function loadAllImages(urlPrefix: string = ''): Promise<void> {
  if (didCallLoadAllImages) {
    throw new Error('called loadAllImages multiple times')
  }
  didCallLoadAllImages = true

  await Promise.all(
    IMAGE_ASSET_URLS.map(src =>
      new Promise<void>((resolve, reject) => {
        const image = new Image()
        image.onload = () => { // start listening for loaded image
          cache.set(src, image)
          addToSpriteAtlas(image)
          resolve()
        }
        image.onerror = reject
        image.src = `${urlPrefix}images/${src}` // queue load
        // console.log('loaded image asset: ', src)
      }),
    ),
  )
}
