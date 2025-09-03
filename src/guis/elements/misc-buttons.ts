/**
 * @file misc-buttons.ts
 *
 * Buttons used in free-cam-gui.
 */

import type { GuiElement } from 'guis/gui'
import type { FreecamLayoutKey } from 'guis/keys/freecam-layout-keys'
import { toggleDebugControls } from 'util/debug-controls'

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
  display: {
    type: 'button',
    icon: `icons/16x16-config.png`,
    gamepadPrompt: {
      name: 'start',
      offset: [-16, 0],
    },
  },
  layoutKey: 'settingsBtn',
  hotkeys: ['Escape', 'ButtonStart'],
  clickAction: ({ seaBlock }) => {
    seaBlock.toggleSettings()
  },
}

export const debugBtn: FreecamElem = {
  display: {
    type: 'button',
    label: '~',
    gamepadPrompt: {
      name: 'back',
      offset: [16, 0],
    },
  },
  layoutKey: 'debugBtn',
  hotkeys: [
    'Backquote', // backtick under esc on keyboard
    'ButtonBack', // small button on controller
  ],
  clickAction: ({ seaBlock }) => {
    // seaBlock.rebuildControls()
    toggleDebugControls(seaBlock)
  },
}
