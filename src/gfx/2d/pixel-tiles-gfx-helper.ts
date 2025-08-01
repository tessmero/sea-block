/**
 * @file pixel-tiles-gfx-helper.ts
 *
 * Used in flat-transition to help draw pixelated
 * tile shapes on the front layer.
 */

import type { TileShape, Tiling } from 'core/grid-logic/tilings/tiling'
import { addToSpriteAtlas } from './sprite-atlas'

// const CACHE_CHANNELS = ['r', 'g', 'b', 'black'] as const
// type CacheChannel = (typeof CACHE_CHANNELS)[number]
const cacheColors = [
  [0, 0, 0, 255], // black
  [255, 0, 0, 255], // red
  [0, 255, 0, 255], // green
  [0, 0, 255, 255], // blue
]

// parameters for tools/build-pixel-tile-shapes.ts
export const IMAGE_SIZE = 30 // width and height for all images
export const SCALES = Array.from({ length: 12 }, (_, n) => n + 1)

export type FillPolygonParams = {
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  scale: number
  chunkScale: number
  shape: TileShape
}

// Generate the filename for a tile image
export function getTileImageFilename(shape: TileShape): string {
  return `${shape.n}_${shape.radius.toFixed(2)}_${shape.angle.toFixed(2)}.png`
}

// Cache for loaded tile images with primary colors
const tileImageCache = new Map<string, HTMLImageElement>()

// max number of active transition shape/colors
const nTempBuffers = 10

// rolling cache with colored images
const tempImageCache: Array<OffscreenCanvas> = []
let ticIndex = 0

export function getTempImagset(tiling: Tiling, color: [number, number, number]) {
  // console.log(`build temp imageset with color ${color}`)
  return tiling.shapes.map(shape => _getTempImage(shape, color))
}

function _getTempImage(shape: TileShape, color: [number, number, number]): OffscreenCanvas {
  const result = tempImageCache[ticIndex]
  ticIndex = (ticIndex + 1) % nTempBuffers

  // draw black,r,g,b channals on result
  const img = getTileImage(shape) as HTMLImageElement
  const ctx = result.getContext('2d') as OffscreenCanvasRenderingContext2D
  ctx.clearRect(0, 0, img.width, img.height)

  const [r, g, b] = color
  ctx.globalCompositeOperation = 'copy'
  ctx.globalAlpha = 1
  _fillChannel(ctx, img, 0)

  ctx.globalCompositeOperation = 'lighten'
  ctx.globalAlpha = r
  _fillChannel(ctx, img, 1)
  ctx.globalAlpha = g
  _fillChannel(ctx, img, 2)
  ctx.globalAlpha = b
  _fillChannel(ctx, img, 3)

  return result
}

// Load all tile images for a set of shapes and scales
export async function preloadPixelTiles(shapes: Array<TileShape>): Promise<void> {
  const promises: Array<Promise<void>> = []

  for (const shape of shapes) {
    const fname = getTileImageFilename(shape)
    const src = `images/tile-shapes/${fname}`
    promises.push(new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        // Create a new canvas 4x taller
        const w = img.width
        const h = img.height
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h * 4
        const ctx = canvas.getContext('2d')!
        for (let i = 0; i < 4; ++i) {
          ctx.drawImage(img, 0, h * i)
          const imageData = ctx.getImageData(0, h * i, w, h)
          const data = imageData.data
          for (let p = 0; p < data.length; p += 4) {
            if (data[p + 3] > 0) {
              const [r, g, b, a] = cacheColors[i]
              data[p] = r
              data[p + 1] = g
              data[p + 2] = b
              data[p + 3] = a
            }
          }
          ctx.putImageData(imageData, 0, h * i)
        }
        const outImg = new window.Image()
        outImg.onload = () => {
          tileImageCache.set(fname, outImg)
          addToSpriteAtlas(outImg)
          resolve()
        }
        outImg.onerror = reject
        outImg.src = canvas.toDataURL()
      }
      img.onerror = reject
      img.src = src
    }))
  }
  await Promise.all(promises)

  // populate tempImageCache with images with dimensions (SCALES.length*IMAGE_SIZE,IMAGE_SIZE)
  for (let i = 0; i < nTempBuffers; i++) {
    const buffer = new OffscreenCanvas(SCALES.length * IMAGE_SIZE, IMAGE_SIZE)
    addToSpriteAtlas(buffer)
    tempImageCache.push(buffer)
  }
}

// Get a loaded tile image
export function getTileImage(shape: TileShape): HTMLImageElement | undefined {
  const fname = getTileImageFilename(shape)
  return tileImageCache.get(fname)
}

// Draw a tile image at (x, y)
export function fillPolygon(params: FillPolygonParams, img: CanvasImageSource) {
  const { ctx, x, y, scale } = params
  const intScale = SCALES[Math.max(0, Math.floor(scale * SCALES.length) - 2)]
  _fillPolygon(ctx, img, intScale, 0, x, y)
  // const scaledWidth = img.width * chunkScale
  // const scaledHeight = img.height * chunkScale
  // ctx.drawImage(img, x - scaledWidth / 2, y - scaledHeight / 2, scaledWidth, scaledHeight)
}

// used to draw temp image in transition init
function _fillChannel(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  img: CanvasImageSource,
  channelIndex: number,
) {
  const w = SCALES.length * IMAGE_SIZE
  const h = IMAGE_SIZE

  ctx.drawImage(img, // draw img on ctx
    0, channelIndex * IMAGE_SIZE, w, h, // rectangle in img
    0, 0, w, h, // rectangle in ctx
  )
}

// used to draw transition
function _fillPolygon(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  scaleIndex: number,
  channelIndex: number,
  destX: number,
  destY: number,
) {
  ctx.drawImage(img, // draw img on ctx
    scaleIndex * IMAGE_SIZE, channelIndex * IMAGE_SIZE, IMAGE_SIZE, IMAGE_SIZE, // rectangle in img
    destX, destY, IMAGE_SIZE, IMAGE_SIZE, // rectangle in ctx
  )
}
