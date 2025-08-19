/**
 * @file image-asset-loader.ts
 *
 * Helper functions to preload and then lookup image assets.
 */

import { addToSpriteAtlas } from './sprite-atlas'

// find public/images -type f | sed 's|^public/images/||;s|$|\",|;s|^|\"|'
export const IMAGE_ASSET_URLS = [

  'textures/kenney-colormap.png',

  'borders/16x16-panel.png',

  'borders/16x16-btn-shiny-default.png',
  'borders/16x16-btn-shiny-hovered.png',
  'borders/16x16-btn-shiny-pressed.png',

  'borders/16x16-btn-square-default.png',
  'borders/16x16-btn-square-hovered.png',
  'borders/16x16-btn-square-pressed.png',

  // 'borders/48x48-joy-region-default.png',
  // 'borders/48x48-joy-region-hovered.png',
  // 'borders/48x48-joy-region-pressed.png',

  // 'borders/24x24-joy-slider-default.png',
  // 'borders/24x24-joy-slider-hovered.png',
  // 'borders/24x24-joy-slider-pressed.png',

  'icons/launch.png',
  `icons/skip.png`,
  `icons/16x16-music.png`,
  'icons/16x16-chess.png',
  `icons/16x16-config.png`,
  `icons/16x16-arrow-up.png`,
  `icons/16x16-arrow-down.png`,
  `icons/16x16-arrow-left.png`,
  `icons/16x16-arrow-right.png`,
  'icons/16x16-ellipsis.png',
  'icons/16x16-x.png',
  'icons/16x16-pan.png',
  'icons/16x16-rotate.png',

  'icons/chess/16x16-queen.png',
  'icons/chess/16x16-rook.png',
  'icons/chess/8x8-queen.png',
  'icons/chess/8x8-pawn.png',
  'icons/chess/16x16-pawn.png',
  'icons/chess/16x16-king.png',
  'icons/chess/8x8-knight.png',
  'icons/chess/8x8-bishop.png',
  'icons/chess/8x8-rook.png',
  'icons/chess/8x8-king.png',
  'icons/chess/16x16-knight.png',
  'icons/chess/16x16-chest.png',
  'icons/chess/16x16-bishop.png',
] as const
export type ImageAssetUrl = (typeof IMAGE_ASSET_URLS)[number]

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
