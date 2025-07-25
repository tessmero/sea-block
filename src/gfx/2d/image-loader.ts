/**
 * @file image-loader.ts
 *
 * Helper functions to preload and then lookup image assets.
 */

const IMAGE_ASSET_URLS = [
  'icons/16x16-btn-default.png',
  'icons/16x16-btn-hovered.png',
  'icons/16x16-btn-pressed.png',
  'icons/btn-launch.png',
  `icons/btn-skip.png`,
  `icons/16x16-btn-music.png`,
  `icons/16x16-btn-config.png`,
  `icons/16x16-btn-arrow-up.png`,
  `icons/16x16-btn-arrow-down.png`,
  `icons/16x16-btn-arrow-left.png`,
  `icons/16x16-btn-arrow-right.png`,
] as const
export type ImageAssetUrl = (typeof IMAGE_ASSET_URLS)[number]

// get preloaded image
export function getImage(url: ImageAssetUrl): HTMLImageElement {
  return imageCache.get(url) as HTMLImageElement
}

const imageCache = new Map<ImageAssetUrl, HTMLImageElement>()

// called on startup in sea-block
export async function loadAllImages(): Promise<void> {
  await Promise.all(
    IMAGE_ASSET_URLS.map(src =>
      new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          imageCache.set(src, img)
          resolve()
        }
        img.onerror = reject
        img.src = src
      }),
    ),
  )
}
