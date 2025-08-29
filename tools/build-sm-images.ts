/**
 * @file build-sm-images.ts
 *
 * Build start menu images, white text with black outline.
 */

import path from 'path'

import { createCanvas, loadImage } from 'canvas'
import fs from 'fs'

const inPath = path.resolve(__dirname, '../public/images/sm-banner.png')
const outPath = path.resolve(__dirname, '../public/images/sm-banner-edge.png')

async function addBlackEdgeToWhite(imgPath: string, outPath: string) {
  const img = await loadImage(imgPath)
  const w = img.width
  const h = img.height
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const src = ctx.getImageData(0, 0, w, h)
  const dst = ctx.createImageData(w, h)
  dst.data.set(src.data)

  // Helper to get pixel RGBA
  function getPixel(x: number, y: number) {
    if (x < 0 || y < 0 || x >= w || y >= h) return [0, 0, 0, 0]
    const i = (y * w + x) * 4
    return [src.data[i], src.data[i + 1], src.data[i + 2], src.data[i + 3]]
  }

  // Helper to set pixel RGBA
  function setPixel(x: number, y: number, r: number, g: number, b: number, a: number) {
    const i = (y * w + x) * 4
    dst.data[i] = r
    dst.data[i + 1] = g
    dst.data[i + 2] = b
    dst.data[i + 3] = a
  }

  // Find all transparent pixels adjacent to white
  for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      const [_r, _g, _b, a] = getPixel(x, y)
      if (a !== 0) continue // not transparent
      // Check 8 neighbors for white
      let adjacentToWhite = false
      for (let dy = -1; dy <= 1; ++dy) {
        for (let dx = -1; dx <= 1; ++dx) {
          if (dx === 0 && dy === 0) continue
          const [nr, ng, nb, na] = getPixel(x + dx, y + dy)
          if (na === 255 && nr === 255 && ng === 255 && nb === 255) {
            adjacentToWhite = true
            break
          }
        }
        if (adjacentToWhite) break
      }
      if (adjacentToWhite) {
        setPixel(x, y, 0, 0, 0, 255) // black
      }
    }
  }

  ctx.putImageData(dst, 0, 0)
  const out = fs.createWriteStream(outPath)
  const stream = canvas.createPNGStream()
  stream.pipe(out)
  out.on('finish', () => console.log('Saved', outPath))
}

addBlackEdgeToWhite(inPath, outPath)
