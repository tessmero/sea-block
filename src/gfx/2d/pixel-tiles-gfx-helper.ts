/**
 * @file pixel-tiles-gfx-helper.ts
 *
 * Used in flat-transition to help draw pixelated
 * tile shapes on the front layer.
 */

import { HEX_TILING_SHAPES } from 'core/grid-logic/tilings/hex-tiling'
import { OCTAGON_TILING_SHAPES } from 'core/grid-logic/tilings/octagon-tiling'
import { SQUARE_TILING_SHAPES } from 'core/grid-logic/tilings/square-tiling'
import type { TileShape } from 'core/grid-logic/tilings/tiling'
import { TRIANGLE_TILING_SHAPES } from 'core/grid-logic/tilings/triangle-tiling'

const CACHE_CHANNELS = ['r', 'g', 'b', 'black'] as const
type CacheChannel = (typeof CACHE_CHANNELS)[number]

const scaleDetail = 1
const scalesToPreload = range(0, 12, scaleDetail)

export type FillPolygonParams = {
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  scale: number
  chunkScale: number
  shape: TileShape }

class PixelTileRenderer {
  public imageCache: Map<string, HTMLImageElement> = new Map()

  public maxScale: number

  constructor(
    public sizes: Array<number>, // array of scale values to preload
    public shapes: Array<TileShape>, // array of polygon shapes to preload
  ) {
    this.maxScale = Math.max(...sizes)
  }

  // Generates a unique key for cache based on polygon params
  private getCacheKey(scale: number, shape: TileShape, channel: CacheChannel): string {
    return `${Math.round(scale / scaleDetail) * scaleDetail}
    ${shape.n}_${shape.radius.toFixed(2)}_${shape.angle.toFixed(2)}_${channel}`
  }

  // Draw polygon path on a 2D canvas context
  private drawPolygon(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number,
    tileShape: TileShape,
  ) {
    const { n } = tileShape
    const radius = 1.1 * scale * tileShape.radius
    // Adjust angle with rotation
    const baseAngle = tileShape.angle + Math.PI / 2
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const vertAngle = baseAngle + (2 * Math.PI * i) / n
      const x = cx + radius * Math.cos(vertAngle)
      const y = cy + radius * Math.sin(vertAngle)
      if (i === 0) {
        ctx.moveTo(x, y)
      }
      else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fill()
  }

  // Pre-renders all combinations of scales, angles, and shapes into images
  async preloadAll(): Promise<void> {
    for (const shape of this.shapes) {
      for (const scale of this.sizes) {
        for (const channel of CACHE_CHANNELS) {
          const key = this.getCacheKey(scale, shape, channel)
          if (this.imageCache.has(key)) {
            continue // Skip if already cached
          }
          this.imageCache.set(key,
            await this.renderPolygonToImage(scale, shape, channel),
          )
        }
      }
    }
  }

  // Render a polygon with given params to an offscreen canvas and convert to Image
  private renderPolygonToImage(
    scale: number,
    shape: TileShape,
    channel: CacheChannel,
  ): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
    // Size estimate: make canvas big enough to hold polygon entirely
      const diameter = 2 * 1.1 * scale * shape.radius
      const canvasSize = Math.max(2, 2 * Math.ceil(diameter / 2))// + 4 // keep even and add some padding
      const canvas = document.createElement('canvas')
      canvas.width = canvasSize
      canvas.height = canvasSize
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = 'black' // Or any fill color you want
      ctx.translate(canvasSize / 2, canvasSize / 2)

      // Draw the polygon
      this.drawPolygon(ctx, 0, 0, scale, shape)

      // threshold slpha and set pixels to either solid channel color or transparent
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const threshold = 127
      const channelOffset = 'rgb'.indexOf(channel)
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > threshold) {
          data[i + 3] = 255 // opaque

          // set to primary color
          data[i + 0] = 0
          data[i + 1] = 0
          data[i + 2] = 0
          if (channel !== 'black') {
            data[i + channelOffset] = 255
          }
        }
        else {
          data[i + 3] = 0 // transparent
        }
      }
      ctx.putImageData(imageData, 0, 0)
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = canvas.toDataURL()
    })
  }

  // Get preloaded image for given params, or undefined if not preloaded
  private getImage(scale: number, shape: TileShape, channel: CacheChannel): HTMLImageElement | undefined {
    const key = this.getCacheKey(scale, shape, channel)
    return this.imageCache.get(key)
  }

  // Draw preloaded polygon image onto a context at (x, y)
  public fillPolygon(params: FillPolygonParams, channel: CacheChannel) {
    const {
      ctx,
      x,
      y,
      scale,
      chunkScale,
      shape,
    } = params

    const img = this.getImage(scale, shape, channel)
    if (!img) {
      // console.log(`Image not preloaded for the given parameters ${this.getCacheKey(scale, shape, channel)}`)
      return
    }
    // Draw image centered at (x, y)
    const scaledWidth = img.width * chunkScale
    const scaledHeight = img.height * chunkScale
    ctx.drawImage(img,
      x - scaledWidth / 2,
      y - scaledHeight / 2,
      scaledWidth, scaledHeight,
    )
  }
}

const instance = new PixelTileRenderer
(
  scalesToPreload,
  [
    ...TRIANGLE_TILING_SHAPES,
    ...SQUARE_TILING_SHAPES,
    ...HEX_TILING_SHAPES,
    ...OCTAGON_TILING_SHAPES,
  ],
)

function range(start, stop, step) {
  if (step === 0) throw new Error('Step cannot be zero.')
  const length = Math.max(Math.ceil((stop - start) / step), 0)
  return Array.from({ length }, (_, i) => start + i * step)
}

export async function preloadPixelTiles() {
  await instance.preloadAll()
  // console.log(`preloaded ${instance.imageCache.size} pixel tile images`)
}

export function fillPolygon(params: FillPolygonParams, color?: [number, number, number]) {
  params.scale = Math.min(params.scale, instance.maxScale)

  if (color) {
    const { ctx } = params
    const [r, g, b] = color
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    instance.fillPolygon(params, 'black')

    ctx.globalCompositeOperation = 'lighten'
    ctx.globalAlpha = r
    instance.fillPolygon(params, 'r')
    ctx.globalAlpha = g
    instance.fillPolygon(params, 'g')
    ctx.globalAlpha = b
    instance.fillPolygon(params, 'b')

    // restore
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }
  else {
    // being used to clear screen, color doesn't matter
    instance.fillPolygon(params, 'r')
  }
}
