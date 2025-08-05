/**
 * @file chess-layout.ts
 *
 * Game-phase banner for chess game.
 */

import { standards } from './layout-helper'
const { btn } = standards

import type { CssLayout } from 'util/layout-parser'

export const CHESS_LAYOUT = {

  phaseLabel: {
    height: 16,
    width: 100,
    left: 'auto',
  },

  // toggle piece info panel
  helpBtn: { ...btn,
    bottom: 0,
  },

  // piece info panel
  helpPanel: {
    width: 100,
    height: 100,
    left: 'auto',
    top: 'auto',
  },

  goalPanel: {
    parent: 'helpPanel',
    height: 50,
  },

  pieceInfoPanel: {
    parent: 'helpPanel',
    height: 50,
    bottom: 0,
  },

  flatViewport: {
    width: 5 * 16,
    height: 5 * 16,
    // left: 'auto',
    // top: 'auto',
    bottom: 0,
    right: 0,
  },

} as const satisfies CssLayout
