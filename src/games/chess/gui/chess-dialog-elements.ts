/**
 * @file chess-dialog-elements.ts
 *
 * Elements and helpers for menus in the main chess layout.
 * These menus are toggled by setting isVisible properties.
 */

import type { GuiElement } from 'guis/gui'
import type { Chess } from '../chess-helper'
import { quitChess } from '../chess-helper'
import type { SeaBlock } from 'sea-block'
import type { ChessButton } from './chess-button'
import { playSound } from 'audio/sound-effects'

// export const gameOverLabel: GuiElement = {
//   layoutKey: 'gameOverLabel',
//   display: {
//     type: 'label',
//     label: 'GAME OVER',
//     isVisible: false,
//   },
// }
const pauseMenuPanel: GuiElement = {
  layoutKey: 'pauseMenuPanel',
  display: {
    type: 'panel',
    isVisible: false,
  },
}

// const resetBtn: GuiElement = {
//   layoutKey: 'resetBtn',
//   display: {
//     type: 'button',
//     label: 'reset level',
//     isVisible: false,
//   },
// }
const resumeBtn: ChessButton = {
  layoutKey: 'resumeBtn',
  display: {
    type: 'button',
    label: 'resume',
    isVisible: false,
  },
  chessAction: ({ chess }) => {
    playSound('click')
    // quitChess(chess, seaBlock)
    togglePauseMenu(chess, false)
  },
}
// const gameOverPanel: GuiElement = {
//   layoutKey: 'gameOverPanel',
//   display: {
//     type: 'panel',
//     isVisible: false,
//   },
// }
const quitBtn: ChessButton = {
  layoutKey: 'quitBtn',
  display: {
    type: 'button',
    label: 'quit chess',
    isVisible: false,
  },
  chessAction: ({ chess }) => {
    playSound('click')
    quitChess(chess)
  },
}

const pauseMenuElements = [
  pauseMenuPanel,
  // resetBtn,
  resumeBtn, quitBtn,
]

let isPauseMenuVisible = false
export function togglePauseMenu(chess: Chess, state?: boolean) {
  if (typeof state === 'boolean') {
    isPauseMenuVisible = state
  }
  else {
    isPauseMenuVisible = !isPauseMenuVisible
  }

  for (const { display } of pauseMenuElements) {
    display.isVisible = isPauseMenuVisible
    display.needsUpdate = true
  }

  if (chess.currentPhase === 'game-over') {
    quitBtn.display.isVisible = true
  }

  chess.context.layeredViewport.handleResize(chess.context)
}

const gameOverElements = [
  // gameOverPanel,
  // gameOverLabel,
  quitBtn,
]

export const CHESS_DIALOG_ELEMENTS = [
  ...gameOverElements,
  ...pauseMenuElements,
]

let isGameOverMenuVisible = false
export function toggleGameOverMenu(seaBlock: SeaBlock, state?: boolean) {
  if (typeof state === 'boolean') {
    isGameOverMenuVisible = state
  }
  else {
    isGameOverMenuVisible = !isGameOverMenuVisible
  }

  for (const { display } of gameOverElements) {
    display.isVisible = isGameOverMenuVisible
    display.needsUpdate = true
  }
  seaBlock.layeredViewport.handleResize(seaBlock)
}
