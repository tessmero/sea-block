/**
 * @file pixel-tile-shapes.test.ts
 *
 * Assert that tile shape images have only black and transparent pixels.
 * They must not be antialiased.
 */

import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { loadImage, createCanvas } from 'canvas'

const TILE_SHAPES_DIR = path.resolve(__dirname, '../../public/images/tile-shapes')

describe('Pixel Tile Shape Images', function () {
  const files = fs.readdirSync(TILE_SHAPES_DIR).filter(f => f.endsWith('.png'))
  for (const fname of files) {
    describe(`Tile shape image ${fname}`, function () {
      it(`has only black or transparent pixels: ${fname}`, async function () {
        const filePath = path.join(TILE_SHAPES_DIR, fname)
        const img = await loadImage(filePath)
        const { width, height } = img
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]
          // Pixel must be fully transparent or fully black
          assert(
            (a === 0) || (r === 0 && g === 0 && b === 0 && a === 255),
            `pixel should be black or transparent in ${fname}: rgba(${r},${g},${b},${a})
             use "npx ts-node tools/build-pixel-tile-shapes.ts" to regenerate images`,
          )
        }
      })
    })
  }
})
