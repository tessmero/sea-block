/**
 * @file chess-hud-layout.ts
 *
 * Heads-up-display elements included in main chess layout.
 */

import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'
import { standards } from '../layout-helper'
const { btn } = standards

import type { CssLayout } from 'util/layout-parser'

export const CHESS_HUD_LAYOUT = {

  phaseLabel: {
    'height': 16,
    'top@portrait': 16,
    'width@landscape': 100,
    'left': 'auto',
  },

  // top bar
  topBar: {
    height: 16,
  },

  // goal display top left
  topLeftDisplay: {
    parent: 'topBar',
    width: 36,
  },

  // stage number top center
  topCenterDisplay: {
    parent: 'topBar',
    width: 100,
    left: 'auto',
  },

  // pause/exit button top right
  topRightBtn: {
    parent: 'topBar',
    ...btn,
    right: 0,
  },

  // world view after using dual-vector-foil
  flatViewport: {
    width: 7 * 16,
    height: 7 * 16,
    left: 'auto',
    top: 'auto',
    // bottom: 0,
    // right: 0,
  },
  // change piece hint
  switchPieceHint: {
    height: 16,
    width: 64,
    bottom: 20,
  },

  // piece select bottom left
  bottomLeft: {
    height: 20,
    width: 64,
    bottom: 0,
  },
  currentPieceButton: {
    parent: 'bottomLeft',

    // width: -btn.width * 2,
    // left: 'auto',
  },
  currentPieceLabel: {
    parent: 'currentPieceButton',
    left: 4,
  },
  currentPieceIcon: {
    parent: 'currentPieceButton',
    width: 20,
    right: 0,
  },

  // prevPiece: {
  //   parent: 'bottomLeft',
  //   ...btn,
  // },
  // nextPiece: {
  //   parent: 'bottomLeft',
  //   ...btn,
  //   right: 0,
  // },

  // // piece info panel
  // helpPanel: {
  //   width: 64,
  //   height: 64,
  //   bottom: 16,
  // },
  // movesDisplay: {
  //   parent: 'helpPanel',
  //   width: 50,
  //   height: 50,
  //   left: 'auto',
  //   top: 'auto',
  // },

  // spawn pawn button bottom right
  pawnBtn: {
    width: 40,
    height: 20,
    bottom: 0,
    right: 0,
  },

  cancelPawnBtn: {
    width: 60,
    height: 20,
    bottom: 0,
    right: 0,
  },

  // pawn hint
  pawnHint: {
    width: 64,
    height: 16,
    bottom: 16,
    right: 0,
  },

} as const satisfies CssLayout<ChessLayoutKey>
