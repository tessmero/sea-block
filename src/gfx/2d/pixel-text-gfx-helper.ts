/**
 * @file pixel-text-gfx-helper.ts
 *
 * Used to draw text labels for gui elements on front layer.
 */

import * as defaultFont from './default-font.json'
import * as miniFont from './mini-font.json'
import type { PixelFontData, Glyph } from './font.json.d.ts'

export type FontVariant = 'default' | 'mini'
export type TextAlign = 'top-left' | 'center'

const basement = 2 // distance below baseline for lowercase q and g

export type DrawTextParams = {
  label: string
  width: number
  height: number
  font?: FontVariant
  textAlign?: TextAlign
}

export function drawText(ctx, params: DrawTextParams) {
  const {
    label, width, height,
    font = 'default',
    textAlign = 'center',
  } = params
  const textPixels = renderPixels(label, font)

  let x0 = 0
  let y0 = 0
  if (textAlign === 'center') {
    x0 = Math.floor(width / 2 - textPixels[0].length / 2)
    y0 = Math.floor(height / 2 - textPixels.length / 2 + basement / 2)
  }

  ctx.fillStyle = font === 'mini' ? 'gray' : 'black'
  for (const [y, row] of textPixels.entries()) {
    for (const [x, value] of row.entries()) {
      if (value === 1) {
        ctx.fillRect(x0 + x, y0 + y, 1, 1)
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
