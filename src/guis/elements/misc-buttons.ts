/**
 * @file misc-buttons.ts
 *
 * Buttons used in free-cam-gui.
 */

import type { GuiElement } from 'guis/gui'
import type { FreecamLayoutKey } from 'guis/keys/freecam-layout-keys'

type FreecamElem = GuiElement<FreecamLayoutKey>

// export const spritAtlasBtn: FreecamElem = {
//   display: { type: 'button', label: 'VIEW SPRITES', font: 'mini' },
//   layoutKey: 'spritAtlasBtn',
//   clickAction: ({ seaBlock }) => {
//     const item = seaBlock.config.tree.children.testGui
//     item.value = 'sprite-atlas'
//     seaBlock.onCtrlChange(item)
//   },
// }

export const fcSettingsBtn: FreecamElem = {
  display: { type: 'button', icon: `icons/16x16-config.png` },
  layoutKey: 'settingsBtn',
  hotkeys: ['Escape', 'ButtonStart'],
  clickAction: ({ seaBlock }) => {
    seaBlock.toggleSettings()
  },
}

// export const raftBtn: FreecamElem = {
//   display: {
//     type: 'button',
//     // icon: `icons/16x16-chess.png`
//     label: 'RAFT',
//   },
//   layoutKey: 'raftBtn',
//   hotkeys: [],
//   clickAction: ({ seaBlock }) => {
//     const item = seaBlock.config.tree.children.game
//     item.value = 'raft'
//     seaBlock.onCtrlChange(item)
//   },
// }

export const debugBtn: FreecamElem = {
  display: { type: 'button', label: '~' },
  layoutKey: 'debugBtn',
  hotkeys: [
    'Backquote', // backtick under esc on keyboard
    'ButtonBack', // small button on controller
  ],
  clickAction: ({ seaBlock }) => {
    seaBlock.rebuildControls()
    // seaBlock.toggleMenu()
  },
}
