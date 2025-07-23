/**
 * @file misc-buttons.ts
 *
 * Buttons that are loaded on startup.
 */

import { toggleRadio } from 'audio/song-playlist'
import type { GameElement } from 'games/game'
import { iconButtonLoader, simpleButtonLoader } from 'gfx/2d/flat-button'

export const musicBtn: GameElement = {
  w: 16, h: 16,
  layoutKey: 'musicBtn',
  hotkeys: ['KeyM'],
  imageLoader: iconButtonLoader(
    'icons/16x16-btn-background.png',
    `icons/16x16-btn-music.png`,
  ),
  clickAction: (_seaBlock) => {
    toggleRadio()
  },
}

export const configBtn: GameElement = {

  w: 16, h: 16,
  layoutKey: 'configBtn',
  hotkeys: [],
  imageLoader: iconButtonLoader(
    'icons/16x16-btn-background.png',
    `icons/16x16-btn-config.png`,
  ),
  clickAction: (seaBlock) => {
    seaBlock.rebuildControls()
  },
}
export const leftJoy: GameElement = {
  w: 64, h: 64,
  layoutKey: 'leftJoy',
  hotkeys: [],
  imageLoader: simpleButtonLoader('L', '50px "Micro5"'),
  clickAction: (seaBlock) => {
    seaBlock.rebuildControls()
  },
}

export const rightJoy: GameElement = {
  w: 64, h: 64,
  layoutKey: 'rightJoy',
  hotkeys: [],
  imageLoader: simpleButtonLoader('R', '50px "Micro5"'),
  clickAction: (seaBlock) => {
    seaBlock.rebuildControls()
  },
}
