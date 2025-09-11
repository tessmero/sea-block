/**
 * @file chess-hud-dialog-elements.ts
 *
 * Elements and helpers for menus in the main chess layout.
 * These menus are toggled by setting isVisible properties.
 */

import type { GuiElement } from 'guis/gui'
import { quitChess } from '../chess'
import type { SeaBlock } from 'sea-block'
import { playSound } from 'audio/sound-effect-player'
import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'
import { PIECE_NAMES } from '../chess-enums'

type ChessElem = GuiElement<ChessLayoutKey>

// export const gameOverLabel: ChessElem = {
//   layoutKey: 'gameOverLabel',
//   display: {
//     type: 'label',
//     label: 'GAME OVER',
//     isVisible: false,
//   },
// }

// const pauseMenuPanel: ChessElem = {
//   layoutKey: 'pauseMenuPanel',
//   display: {
//     type: 'panel',
//     isVisible: false,
//   },
// }

// const resetBtn: ChessElem = {
//   layoutKey: 'resetBtn',
//   display: {
//     type: 'button',
//     label: 'reset level',
//     isVisible: false,
//   },
// }
// const resumeBtn: ChessElem = {
//   layoutKey: 'resumeBtn',
//   display: {
//     type: 'button',
//     label: 'resume',
//     isVisible: false,
//   },
//   clickAction: () => {
//     playSound('click')
//     // quitChess(chess, seaBlock)
//     togglePauseMenu(false)
//   },
// }
// const gameOverPanel: ChessElem = {
//   layoutKey: 'gameOverPanel',
//   display: {
//     type: 'panel',
//     isVisible: false,
//   },
// }
const quitBtn: ChessElem = {
  layoutKey: 'quitBtn',
  display: {
    type: 'button',
    label: 'quit chess',
    isVisible: false,
  },
  clickAction: () => {
    playSound('click')
    quitChess()
  },
}

// const pauseMenuElements = [
//   pauseMenuPanel,
//   // resetBtn,
//   resumeBtn, quitBtn,
// ] as const satisfies Array<ChessElem>

const gameOverElements = [
  // gameOverPanel,
  // gameOverLabel,
  quitBtn,
] as const satisfies Array<ChessElem>

export const pieceHelpPanel: GuiElement<ChessLayoutKey> = {
  layoutKey: 'pieceHelpPanel',
  display: {
    type: 'panel',
    isVisible: false,
  },
}

export const pieceHelpCloseBtn: GuiElement<ChessLayoutKey> = {
  layoutKey: 'pieceHelpCloseBtn',
  display: {
    type: 'button',
    label: 'CLOSE',
    isVisible: false,
  },
}

// One diagram per piece type
export const pieceHelpDiagrams: Array<GuiElement<ChessLayoutKey>> = PIECE_NAMES.map(piece => ({
  layoutKey: 'pieceHelpDiagram',
  display: {
    type: 'diagram',
    label: `help-${piece}`, // give imageset unique hash
    isVisible: false,
    description: `${piece} help`,
  },
}))

const pieceHelpElements = [
  pieceHelpPanel,
  ...pieceHelpDiagrams,
  pieceHelpCloseBtn,
] satisfies Array<GuiElement<ChessLayoutKey>>

export const CHESS_HUD_DIALOG_ELEMENTS = [
  ...gameOverElements,
  // ...pauseMenuElements,
  ...pieceHelpElements,
] as const satisfies Array<ChessElem>

let isPieceHelpVisible = false
export function togglePieceHelp(state?: boolean) {
  if (typeof state === 'boolean') {
    isPieceHelpVisible = state
  }
  else {
    isPieceHelpVisible = !isPieceHelpVisible
  }

  for (const { display } of pieceHelpElements) {
    display.isVisible = isPieceHelpVisible
    display.needsUpdate = true
  }
}

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
