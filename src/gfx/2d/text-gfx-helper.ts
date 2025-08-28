/**
 * @file text-gfx-helper.ts
 *
 * Used to draw text labels for gui elements on front layer.
 */

import * as defaultFont from './default-font.json'
import * as miniFont from './mini-font.json'
import type { PixelFontData, Glyph } from './font.json.d.ts'

export type FontVariant = 'default' | 'mini' | 'mini-white'
export type TextAlign = 'top-left' | 'center' | 'left'

const basement = 2 // distance below baseline for lowercase q and g

export type DrawTextParams = {
  label: string
  width: number
  height: number
  font?: FontVariant
  color?: string
  textAlign?: TextAlign
  offset?: [number, number]
}

export function drawText(ctx, params: DrawTextParams) {
  const {
    label, width, height,
    font = 'default',
    color = 'black',
    textAlign = 'center',
    offset = [0, 0],
  } = params
  // Trim raw string and each line for formatted multiline support
  let processedLabel = label
  if (font === 'mini') {
    processedLabel = processedLabel.toUpperCase()
  }
  const lines = processedLabel.trim().split('\n').map(line => line.trim())

  const fontData = getFontData(font)
  const extHeight = fontData.lineHeight + basement
  const numLines = lines.length

  // Render each line to pixel arrays
  const linePixels = lines.map(line => renderPixels(line, font))
  // Find max width among all lines
  const maxLineWidth = Math.max(...linePixels.map(pixels => pixels[0]?.length || 0))

  let x0 = 0
  let y0 = 0
  if (textAlign === 'center') {
    x0 = Math.floor(width / 2 - maxLineWidth / 2)
    y0 = Math.floor(height / 2 - (numLines * extHeight) / 2 + basement / 2)
  }
  else if (textAlign === 'left') {
    y0 = Math.floor(height / 2 - (numLines * extHeight) / 2 + basement / 2)
  }

  x0 += offset[0]
  y0 += offset[1]

  ctx.fillStyle = color
  for (let i = 0; i < numLines; i++) {
    const pixels = linePixels[i]
    for (const [y, row] of pixels.entries()) {
      for (const [x, value] of row.entries()) {
        if (value === 1) {
          ctx.fillRect(x0 + x, y0 + y + i * extHeight, 1, 1)
        }
      }
    }
  }
}

function getFontData(variant: FontVariant): PixelFontData {
  return variant === 'default' ? defaultFont : miniFont
}

// render arrays of 0 and 1
function renderPixels(label, variant: FontVariant = 'default'): Array<Array<number>> {
  const fontData = getFontData(variant)
  const { glyphs, lineHeight } = fontData
  const extHeight = lineHeight + basement // including basement for lowercase q and g
  const result: Array<Array<number>> = []

  // Initialize result rows
  for (let i = 0; i < extHeight; i++) {
    result[i] = []
  }

  let isFirst = true

  for (const char of label) {
    const glyph: Glyph = glyphs[char]// || glyphs[char.toUpperCase()]
    if (!glyph) continue // skip unknown chars

    // Add 1 column of space (0s) between glyphs
    if (!isFirst) {
      for (let i = 0; i < extHeight; i++) {
        result[i].push(0)
      }
    }
    isFirst = false

    // Copy glyph pixels into result
    const blankRow = new Array(glyph.pixels[0].length).fill(0)
    for (let row = 0; row < extHeight; row++) {
      const glyphRow = glyph.pixels[row - glyph.offset] || blankRow
      result[row].push(...glyphRow)
    }
  }

  return result
}
