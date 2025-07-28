/**
 * @file image-asset-loader.ts
 *
 * Helper functions to preload and then lookup image assets.
 */

export const IMAGE_ASSET_URLS = [
  'borders/16x16-panel.png',
  'borders/16x16-btn-shiny-default.png',
  'borders/16x16-btn-shiny-hovered.png',
  'borders/16x16-btn-shiny-pressed.png',
  'borders/16x16-btn-square-default.png',
  'borders/16x16-btn-square-hovered.png',
  'borders/16x16-btn-square-pressed.png',
  'icons/launch.png',
  `icons/skip.png`,
  `icons/16x16-music.png`,
  `icons/16x16-config.png`,
  `icons/16x16-arrow-up.png`,
  `icons/16x16-arrow-down.png`,
  `icons/16x16-arrow-left.png`,
  `icons/16x16-arrow-right.png`,
  'icons/16x16-ellipsis.png',
  'icons/16x16-x.png',
  'icons/16x16-pan.png',
  'icons/16x16-rotate.png',
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
        img.src = `images/${src}`
      }),
    ),
  )
}
