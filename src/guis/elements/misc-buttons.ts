/**
 * @file misc-buttons.ts
 *
 * Buttons used in free-cam-gui.
 */

import { toggleRadio } from 'audio/song-playlist'
import { originalTargetMeshPosition, targetElement, targetMesh } from 'games/imp/free-cam-game'
import type { GuiElement } from 'guis/gui'

export const startGamePanel: GuiElement = {
  layoutKey: 'startGamePanel',
  display: {
    type: 'panel',
    isVisible: false,
  },
}
export const startGameLabel: GuiElement = {
  layoutKey: 'startGameLabel',
  display: {
    type: 'label',
    label: 'Rook',
    isVisible: false,
  },
}
export const startGameButton: GuiElement = {
  layoutKey: 'startGameButton',
  display: {
    type: 'button',
    label: 'Play',
    isVisible: false,
  },
  clickAction: ({ seaBlock }) => {
    const item = seaBlock.config.tree.children.game
    item.value = 'chess'
    seaBlock.onCtrlChange(item)
  },
}
export const cancelGameButton: GuiElement = {
  layoutKey: 'cancelGameButton',
  display: {
    type: 'button',
    label: 'Cancel',
    isVisible: false,
  },
  clickAction: ({ seaBlock }) => {
    targetElement.layoutKey = undefined
    targetMesh.position.copy(originalTargetMeshPosition)
    for (const { display } of startGameElements) {
      display.isVisible = false
    }
    seaBlock.layeredViewport.handleResize(seaBlock)
  },
}
export const startGameElements = [
  startGamePanel, startGameLabel, startGameButton, cancelGameButton,
]

// export const spritAtlasBtn: GuiElement = {
//   display: { type: 'button', label: 'VIEW SPRITES', font: 'mini' },
//   layoutKey: 'spritAtlasBtn',
//   clickAction: ({ seaBlock }) => {
//     const item = seaBlock.config.tree.children.testGui
//     item.value = 'sprite-atlas'
//     seaBlock.onCtrlChange(item)
//   },
// }

export const musicBtn: GuiElement = {
  display: { type: 'button', icon: `icons/16x16-music.png` },
  layoutKey: 'musicBtn',
  hotkeys: ['KeyM'],
  clickAction: () => {
    toggleRadio()
  },
}

export const chessBtn: GuiElement = {
  display: { type: 'button', icon: `icons/16x16-chess.png` },
  layoutKey: 'chessBtn',
  hotkeys: [],
  clickAction: ({ seaBlock }) => {
    const item = seaBlock.config.tree.children.game
    item.value = 'chess'
    seaBlock.onCtrlChange(item)
  },
}

export const configBtn: GuiElement = {
  display: { type: 'button', icon: `icons/16x16-config.png` },
  layoutKey: 'configBtn',
  hotkeys: ['Escape'],
  clickAction: ({ seaBlock }) => {
    seaBlock.rebuildControls()
    // seaBlock.toggleMenu()
  },
}
