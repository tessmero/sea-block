/**
 * @file chess-layout.ts
 *
 * HUD for chess game, and dialogs that may appear on top of hud.
 */

import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'
import type { CssLayout } from 'util/layout-parser'
import { CHESS_HUD_LAYOUT } from './chess-hud-layout'
import { CHESS_GAME_OVER_LAYOUT } from './chess-game-over-layout'
import { CHESS_PIECE_HELP_LAYOUT } from './chess-piece-help-layout'
import { CHESS_PAUSE_MENU_LAYOUT } from './chess-pause-menu-layout'

export const CHESS_LAYOUT = {

  ...CHESS_HUD_LAYOUT,
  ...CHESS_PIECE_HELP_LAYOUT,
  ...CHESS_PAUSE_MENU_LAYOUT,
  ...CHESS_GAME_OVER_LAYOUT,

} as const satisfies CssLayout<ChessLayoutKey>
