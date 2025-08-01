/**
 * @file build-pixel-tile-shapes.ts
 *
 * Generate pixelated tile shape .pngs in public/images/tile-shapes.
 */

import fs from 'fs'
import path from 'path'
import { createCanvas } from 'canvas'
import { IMAGE_SIZE, SCALES } from '../src/gfx/2d/pixel-tiles-gfx-helper'
import { populateRegistry } from './util'

import { TILING } from '../src/imp-names'
populateRegistry(TILING)
import { Tiling } from '../src/core/grid-logic/tilings/tiling'

async function main() {
  const outDir = path.resolve(__dirname, '../public/images/tile-shapes')
  fs.rmSync(outDir, { recursive: true, force: true })
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  for (const shape of Tiling.getAllShapes()) {
    // Create a wide canvas for all scales side-by-side
    const canvas = createCanvas(IMAGE_SIZE * SCALES.length, IMAGE_SIZE)
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, IMAGE_SIZE * SCALES.length, IMAGE_SIZE)

    for (let s = 0; s < SCALES.length; s++) {
      const scale = SCALES[s]
      ctx.save()
      ctx.translate(IMAGE_SIZE / 2 + s * IMAGE_SIZE, IMAGE_SIZE / 2)
      // Draw polygon or square
      const { n, radius, angle } = shape
      const r = scale * radius
      ctx.fillStyle = 'black'
      ctx.globalAlpha = 1
      if (n === 4) {
        // ctx.save()
        // ctx.rotate(angle + Math.PI / 4) // align to flat-top
        const side = r * Math.SQRT2
        ctx.fillRect(-side / 2, -side / 2, side, side)
        // ctx.restore()
      }
      else {
        ctx.beginPath()
        for (let i = 0; i < n; i++) {
          const a = angle + Math.PI / 2 + (2 * Math.PI * i) / n
          const x = r * Math.cos(a)
          const y = r * Math.sin(a)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
      }
      ctx.restore()
    }

    // Make non-opaque pixels fully transparent for the whole image
    const imageData = ctx.getImageData(0, 0, IMAGE_SIZE * SCALES.length, IMAGE_SIZE)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      // always black rgb (though it doesn't matter if transparent)
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      if (data[i + 3] > 0) {
        data[i + 3] = 255 // opaque
      }
      else {
        data[i + 3] = 0 // transparent
      }
    }
    ctx.putImageData(imageData, 0, 0)

    // Save PNG (omit scale from filename)
    const fname = `${shape.n}_${shape.radius.toFixed(2)}_${shape.angle.toFixed(2)}.png`
    const outPath = path.join(outDir, fname)
    fs.writeFileSync(outPath, canvas.toBuffer('image/png'))
  }
  console.log('Condensed tile shape images written to', outDir)
}
main()
