/**
 * @file chess-game-over-layout.ts
 *
 * Extra elemenets shown after player is captured, included in main chess layout.
 */

import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'
// import { standards } from '../layout-helper'
// const { btn } = standards

import type { CssLayout } from 'util/layout-parser'

export const CHESS_GAME_OVER_LAYOUT = {

  // game over dialog
  // gameOverPanel: {
  //   width: 5 * 16,
  //   height: 3 * 16,
  //   left: 'auto',
  //   bottom: 20,
  // },
  // gameOverLabel: {
  //   parent: 'gameOverPanel',
  //   height: 20,
  // },
} as const satisfies CssLayout<ChessLayoutKey>
