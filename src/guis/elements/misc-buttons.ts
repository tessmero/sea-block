/**
 * @file misc-buttons.ts
 *
 * Buttons used in free-cam-gui.
 */

import { toggleRadio } from 'audio/song-playlist'
import type { GuiElement } from 'guis/gui'

export const spritAtlasBtn: GuiElement = {
  display: { type: 'button', label: 'VIEW SPRITES', font: 'mini' },
  layoutKey: 'spritAtlasBtn',

  clickAction: ({ seaBlock }) => {
    const item = seaBlock.config.tree.children.testGui
    item.value = 'sprite-atlas'
    seaBlock.onCtrlChange(item)
  },
}

export const musicBtn: GuiElement = {
  display: { type: 'button', icon: `icons/16x16-music.png` },
  layoutKey: 'musicBtn',
  hotkeys: ['KeyM'],
  clickAction: () => {
    toggleRadio()
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
