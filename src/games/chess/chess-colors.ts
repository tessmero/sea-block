/**
 * @file chess-colors.ts
 *
 * Helpers to color terrain tiles used as chess board.
 */

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { ChessTileHighlight } from './chess-hl-tiles'
import type { TileColors } from 'gfx/styles/style'
import { Color } from 'three'

export function pickColorsForChessTile(tile: TileIndex, highlight?: ChessTileHighlight): TileColors {
  const { x, z } = tile
  const checkeredIndex = Math.abs((x + z) % 2)
  const data = highlight && hlColors[highlight]
    ? hlColors[highlight][checkeredIndex]
    : baseChessBoardColors[checkeredIndex]
  return {
    top: data.top,
    sides: data.sides,
  }
}

export const baseChessBoardColors: readonly [TileColors, TileColors] = [
  {
    // White tile: light gray
    top: new Color('#E1E2EF'),
    sides: new Color('#C1C2CF'),
  },
  {
    // Black tile: tan
    top: new Color('#D1BB9E'),
    sides: new Color('#A79277'),
  },
]

const hlColors: Record<ChessTileHighlight, [TileColors, TileColors]> = {
  hover: [
    {
      // White tile hover: blue highlight
      top: new Color('#B3CFFF'),
      sides: new Color('#7FA7E0'),
    },
    {
      // Black tile hover: orange highlight
      top: new Color('#8aabe3'),
      sides: new Color('#4f6584'),
    },
  ],
  allowedMove: [
    {
      // White tile allowed move: greenish
      top: new Color('#81E28F'),
      sides: new Color('#71C27F'),
    },
    {
      // Black tile allowed move: greenish
      top: new Color('#41BB6E'),
      sides: new Color('#379247'),
    },
  ],
}
