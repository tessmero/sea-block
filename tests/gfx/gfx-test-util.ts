/**
 * @file gfx-test-util.ts
 *
 * Helpers to assert that test images conform to solid-color pixel style.
 * Anti-aliasing (blending colors to smooth edges) is not allowed.
 */

import path from 'path'
import fs from 'fs'
import assert from 'assert'
import { Canvas } from 'canvas'
import { Color, ColorRepresentation } from 'three'

export type Pallette = Array<ColorRepresentation | [number, number, number]>

export type Params = {
  expectedPallette: Pallette
  expectMissingColors?: number
}

export function inspectAssetImage(image: HTMLImageElement) {
  // extract canvas and pallette that could be used for  assertNotAntialiased
  const canvas = new Canvas(image.width, image.height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    0, 0, image.width, image.height)

  // Extract the palette from the canvas
  const pallette = extractPalette(canvas)

  return { canvas, pallette }
}

export function assertNotAntialiased(canvas: Canvas, params: Params) {
  const {
    expectedPallette,
    expectMissingColors = 0,
  } = params

  // Assert expected palette has valid, unique colors
  const palletteRgbaValues = expectedPallette.map(rep => getRgba(rep))
  const seen = new Set<string>()
  for (let i = 0; i < palletteRgbaValues.length; i++) {
    const c = palletteRgbaValues[i]
    // Check valid RGB values
    assert.ok(Number.isInteger(c.r) && c.r >= 0 && c.r <= 255, `Palette color ${i} has invalid r value: ${c.r}`)
    assert.ok(Number.isInteger(c.g) && c.g >= 0 && c.g <= 255, `Palette color ${i} has invalid g value: ${c.g}`)
    assert.ok(Number.isInteger(c.b) && c.b >= 0 && c.b <= 255, `Palette color ${i} has invalid b value: ${c.b}`)

    // Check uniqueness
    const key = `${c.r},${c.g},${c.b}`
    assert.ok(!seen.has(key), `Palette contains duplicate color at index ${i}: ${key}`)
    seen.add(key)
  }
  const ctx = canvas.getContext('2d')
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  // Count pixels for each palette color
  const colorCounts = new Array(expectedPallette.length).fill(0)
  let otherColorCount = 0
  for (let i = 0; i < imgData.length; i += 4) {
    const pixel = {
      r: imgData[i],
      g: imgData[i + 1],
      b: imgData[i + 2],
      a: imgData[i + 3],
    }
    if (pixel.a === 0) {
      continue // ignore transparent pixel
    }

    let found = false
    for (let j = 0; j < palletteRgbaValues.length; j++) {
      const c = palletteRgbaValues[j]

      if (pixel.r === c.r && pixel.g === c.g && pixel.b === c.b) {
        colorCounts[j]++
        found = true
        break
      }
    }
    if (!found) {
      otherColorCount++
    }
  }

  // Assert each present palette color appears in at least 10 pixels
  for (let i = 0; i < colorCounts.length; i++) {
    if (colorCounts[i] === 0) {
      continue // missing color handled later
    }
    const minCount = 3
    assert.ok(colorCounts[i] >= minCount,
      `Palette color ${i} should appear in at least ${minCount} pixels, found ${colorCounts[i]}`)
  }
  // Assert no other colors appear
  assert.equal(otherColorCount, 0,
    `Found ${otherColorCount} pixels with colors not in palette: ${JSON.stringify(expectedPallette)}`)

  // Collect missing palette colors (count 0)
  const missingColors: Array<number> = []
  for (let i = 0; i < colorCounts.length; i++) {
    if (colorCounts[i] === 0) {
      missingColors.push(i)
    }
  }
  assert.equal(
    missingColors.length,
    expectMissingColors,
    `Expected ${expectMissingColors} missing palette colors, found ${missingColors.length}: [`
    + missingColors.join(', ') + ']',
  )
}

export function extractPalette(canvas: Canvas): Pallette {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const colorCount: Record<string, number> = {}

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i]
    const g = imageData[i + 1]
    const b = imageData[i + 2]
    const key = `${r},${g},${b}`
    colorCount[key] = (colorCount[key] || 0) + 1
  }

  const sortedColors = Object.entries(colorCount)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number)
      return [r, g, b]// `rgb(${r},${g},${b})`
    })

  return sortedColors as Pallette
}

function getRgba(colorRep: ColorRepresentation | [number, number, number]) {
  if (typeof colorRep[0] === 'number') {
    const [r, g, b] = colorRep as [number, number, number]
    return { r, g, b }
  }
  return _getRgba(colorRep as ColorRepresentation)
}
function _getRgba(colorRep: ColorRepresentation) {
  const color = new Color(colorRep)
  return {
    r: Math.round(color.r * 255),
    g: Math.round(color.g * 255),
    b: Math.round(color.b * 255),
  }
}

export function saveTestImage(canvas: Canvas, name: string) {
  const outFile = path.resolve(__dirname, `test-images/${name}.png`)
  fs.writeFileSync(outFile, canvas.toBuffer('image/png'))
}
