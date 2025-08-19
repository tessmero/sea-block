/**
 * @file chess-pause-menu-layout.ts
 *
 * Layout for pause menu included in main chess gui layout.
 */

import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'
import type { CssLayout } from 'util/layout-parser'

export const CHESS_PAUSE_MENU_LAYOUT = {

  // pause menu
  pauseMenuPanel: {
    width: 5 * 16,
    height: 3 * 16,
    left: 'auto',
    top: 'auto',
  },
  pauseMenuInner: {
    parent: 'pauseMenuPanel',
    margin: 8,
  },
  resetBtn: {
    parent: 'pauseMenuInner',
    height: 16,
  },
  resumeBtn: {
    parent: 'pauseMenuInner',
    height: 16,
  },
  quitBtn: {
    parent: 'pauseMenuInner',
    height: 16,
    bottom: 0,
  },
} as const satisfies CssLayout<ChessLayoutKey>
