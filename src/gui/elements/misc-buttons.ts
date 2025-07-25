/**
 * @file misc-buttons.ts
 *
 * Buttons that are loaded on startup.
 */

import { toggleRadio } from 'audio/song-playlist'
import type { GameElement } from 'games/game'
import { StartSequenceGame } from 'games/start-sequence-game'
import { iconButton, simpleButton } from 'gfx/2d/flat-button'
import { DropTransition } from 'gfx/3d/drop-transition'
import { Transition } from 'gfx/transition'
import type { SeaBlock } from 'sea-block'

export const launchBtn: GameElement = {
  w: 64, h: 32,
  layoutKey: 'launch',
  hotkeys: ['Space'],
  isSticky: true,
  imageFactory: (w, h) => iconButton(w, h, 'icons/btn-launch.png'),
  // imageFactory: (w,h) => simpleButton(w,h,'LAUNCH'),
  clickAction: (seaBlock: SeaBlock) => {
    seaBlock.startTransition()
  },
}

export const skipBtn: GameElement = {
  w: 48, h: 16,
  layoutKey: 'skip',
  hotkeys: ['Escape', 'Space'],
  // imageLoader: simpleButtonLoader('SKIP', '25px "Micro5"'),
  imageFactory: (w, h) => iconButton(w, h, `icons/btn-skip.png`),
  clickAction: (seaBlock: SeaBlock) => {
    seaBlock.config.tree.children.game.value = 'free-cam'
    Transition.isFirstUncover = false
    DropTransition.t = 0
    seaBlock.startTransition()
    StartSequenceGame.wasSkipped = true
  },
}

export const musicBtn: GameElement = {
  w: 16, h: 16,
  layoutKey: 'musicBtn',
  hotkeys: ['KeyM'],
  imageFactory: (w, h) => iconButton(w, h,
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
  imageFactory: (w, h) => iconButton(w, h,
    `icons/16x16-btn-config.png`,
  ),
  clickAction: (seaBlock) => {
    // seaBlock.startTransition()
    // seaBlock.toggleMenu()
    seaBlock.rebuildControls()
  },
}

export const leftJoy: GameElement = {
  w: 64, h: 64,
  layoutKey: 'leftJoy',
  hotkeys: [],
  imageFactory: (w, h) => simpleButton(w, h, 'L'),
  clickAction: (seaBlock) => {
    seaBlock.rebuildControls()
  },
}

export const rightJoy: GameElement = {
  w: 64, h: 64,
  layoutKey: 'rightJoy',
  hotkeys: [],
  imageFactory: (w, h) => simpleButton(w, h, 'R'),
  clickAction: (seaBlock) => {
    seaBlock.rebuildControls()
  },
}
