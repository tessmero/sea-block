/**
 * @file chess-colors.ts
 *
 * Helpers to color terrain tiles used as chess board.
 */

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { ChessTileHighlight } from './chess-hl-tiles'
import type { TileColors } from 'gfx/styles/style'
import { Color, type ColorRepresentation } from 'three'

type ChessTileColorData = { top: ColorRepresentation, sides: ColorRepresentation }

export function pickColorsForChessTile(tile: TileIndex, highlight?: ChessTileHighlight): TileColors {
  const { x, z } = tile
  const checkeredIndex = Math.abs((x + z) % 2)
  const data = highlight && hlColors[highlight]
    ? hlColors[highlight][checkeredIndex]
    : baseColors[checkeredIndex]
  return {
    top: new Color(data.top),
    sides: new Color(data.sides),
  }
}

const baseColors: readonly [ChessTileColorData, ChessTileColorData] = [
  {
    // White tile: light gray
    top: '#E1E2EF',
    sides: '#C1C2CF',
  },
  {
    // Black tile: tan
    top: '#D1BB9E',
    sides: '#A79277',
  },
]

const hlColors: Record<ChessTileHighlight, [ChessTileColorData, ChessTileColorData]> = {
  hover: [
    {
      // White tile hover: blue highlight
      top: '#B3CFFF',
      sides: '#7FA7E0',
    },
    {
      // Black tile hover: orange highlight
      top: '#8aabe3',
      sides: '#4f6584',
    },
  ],
  allowedMove: [
    {
      // White tile allowed move: greenish
      top: '#81E28F',
      sides: '#71C27F',
    },
    {
      // Black tile allowed move: greenish
      top: '#41BB6E',
      sides: '#379247',
    },
  ],
}

// const schemes = target ? {
//   white: { // greenish
//     main: '#81E28F',
//     light: '#91F29F',
//     dark: '#71C27F',
//   },
//   black: { // greenish
//     main: '#41BB6E',
//     light: '#5AD880',
//     dark: '#379247',
//   },
// } : {
//   white: {
//     main: '#E1E2EF',
//     light: '#F1F2FF',
//     dark: '#C1C2CF',
//   },
//   black: {
//     main: '#D1BB9E',
//     light: '#EAD8C0',
//     dark: '#A79277',
//   },
// }
