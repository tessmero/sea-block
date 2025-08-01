/**
 * @file font.json.d.ts
 *
 * Types and module definition used to import json font data.
 */

// allow import from .jsonc file used for pixel font
declare module '*font.json' {
  const value: PixelFontData
  export = value
}

export interface PixelFontData {
  source?: string
  lineHeight: number
  description: string
  isFixedWidth: boolean
  glyphs: Record<string, Glyph>
}

export interface Glyph {
  offset: number
  pixels: Array<Array<number>>
}
