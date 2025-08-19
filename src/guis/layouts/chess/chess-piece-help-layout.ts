/**
 * @file chess-piece-help-layout.ts
 *
 * Chess piece help prompt included in main chess gui layout.
 */

import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'

import type { CssLayout } from 'util/layout-parser'

export const CHESS_PIECE_HELP_LAYOUT = {
  pieceHelpPanel: {
    width: 5 * 16,
    height: 6 * 16,
    left: 0,
    top: 0,
  },
  pieceHelpDiagram: {
    parent: 'pieceHelpPanel',
    margin: 8,
    width: 5 * 16 - 16,
    height: 6 * 16 - 32,
    top: 16,
  },
  pieceHelpCloseBtn: {
    parent: 'pieceHelpPanel',
    right: 8,
    top: 8,
    width: 32,
    height: 20,
  },
} as const satisfies CssLayout<ChessLayoutKey>
