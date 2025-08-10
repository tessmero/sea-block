/**
 * @file chess-dialog-elements.ts
 *
 * Elements and helpers for menus in the main chess layout.
 * These menus are toggled by setting isVisible properties.
 */

import type { GuiElement } from 'guis/gui'
import { quitChess } from '../chess-helper'
import type { SeaBlock } from 'sea-block'

export const gameOverLabel: GuiElement = {
  layoutKey: 'gameOverLabel',
  display: {
    type: 'label',
    label: 'GAME OVER',
    isVisible: false,
  },
}
const pauseMenuPanel: GuiElement = {
  layoutKey: 'pauseMenuPanel',
  display: {
    type: 'panel',
    isVisible: false,
  },
}

const resetBtn: GuiElement = {
  layoutKey: 'resetBtn',
  display: {
    type: 'button',
    label: 'reset level',
    isVisible: false,
  },
}
const resumeBtn: GuiElement = {
  layoutKey: 'resumeBtn',
  display: {
    type: 'button',
    label: 'resume',
    isVisible: false,
  },
  clickAction: ({ seaBlock }) => {
    togglePauseMenu(seaBlock, false)
  },
}
const quitBtn: GuiElement = {
  layoutKey: 'quitBtn',
  display: {
    type: 'button',
    label: 'quit chess',
    isVisible: false,
  },
  clickAction: ({ seaBlock }) => {
    quitChess(seaBlock)
  },
}

const pauseMenuElements = [
  pauseMenuPanel, resetBtn, resumeBtn, quitBtn,
]

let isPauseMenuVisible = false
export function togglePauseMenu(seaBlock: SeaBlock, state?: boolean) {
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
  seaBlock.layeredViewport.handleResize(seaBlock)
}

export const CHESS_DIALOG_ELEMENTS = [
  gameOverLabel, // after aptured by red chess piece
  ...pauseMenuElements,
]

const gameOverElements = [
  pauseMenuPanel, gameOverLabel, quitBtn,
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
