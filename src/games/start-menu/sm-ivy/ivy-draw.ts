/**
 * @file ivy-draw.ts
 *
 * Draw function from tessmero/ivy.
 */
import { smIvy, smIvyConstants } from './sm-ivy'
import { Color } from 'three'
import type { GameUpdateContext } from 'games/game'
import { createNoise2D } from 'simplex-noise'

let t = 0
const noise2D = createNoise2D()

// Precompute 100 random-hue, high-lightness colors using three.js
const vineBaseHue = Math.random()
const vineHueRad = 0.3
const color = new Color()
const vineColors: Array<string> = Array.from({ length: 100 }, () => {
  const hue = vineBaseHue + (Math.random() * 2 - 1) * vineHueRad
  const saturation = 0.5
  const lightness = 0.3
  color.setHSL(hue, saturation, lightness)
  return '#' + color.getHexString()
})

// Render graphics
export function ivyDraw({ seaBlock: _seaBlock, dt }: GameUpdateContext) {
  // draw new vines on buffer
  const ctx = smIvy.ctx
  // Pick a random color for this draw call
  const randomColor = vineColors[Math.floor(Math.random() * vineColors.length)]
  ctx.strokeStyle = randomColor
  ctx.fillStyle = randomColor
  ctx.lineWidth = smIvyConstants.vineThickness
  ctx.lineCap = 'round'
  const newTwigs = smIvy.allVines.flatMap(v => v.draw(ctx))
  smIvy.allVines.push(...newTwigs)

  // re-draw whole visible canvas in overlapping square chunks, with perlin noise offsets
  smIvy.finalCtx.clearRect(0, 0, smIvy.canvas.width, smIvy.canvas.height)
  const chunkSize = 10 // size of each square chunk
  const overlap = 2 // overlap between chunks
  t += dt * 2e-4 // speed
  const noiseScale = 0.08
  const offsetAmount = 0.5 // max px offset
  for (let y = 0; y < smIvy.canvas.height; y += chunkSize - overlap) {
    for (let x = 0; x < smIvy.canvas.width; x += chunkSize - overlap) {
      const w = Math.min(chunkSize, smIvy.canvas.width - x)
      const h = Math.min(chunkSize, smIvy.canvas.height - y)
      // Calculate perlin noise offsets
      const nx = x * noiseScale
      const ny = y * noiseScale
      const ox = noise2D(nx, ny + t) * offsetAmount
      const oy = noise2D(nx + 100, ny + t + 100) * offsetAmount
      smIvy.finalCtx.drawImage(
        smIvy.buffer,
        x, y, w, h, // source rect
        x + ox, y + oy, w, h, // destination rect with offset
      )
    }
  }

  // // debug
  // // draw screen corners
  // const r = 0.1
  // ctx.fillStyle = 'red'
  // smIvy.screenCorners.forEach(c => ctx.fillRect(c.x - r, c.y - r, 2 * r, 2 * r))
}
