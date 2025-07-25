/**
 * @file settings-menu.ts
 *
 * In-game gui elements to change a few config settings.
 */
import type { GameElement } from 'games/game'
import { simpleButton } from 'gfx/2d/flat-button'

export const backPanel: GameElement = {
  w: 64, h: 64,
  layoutKey: 'backPanel',
  hotkeys: [],
  imageFactory: (w, h) => simpleButton(w, h, ''),
}
export const styleBtn: GameElement = {
  w: 64, h: 16,
  layoutKey: 'styleBtn',
  hotkeys: [],
  imageFactory: (w, h) => simpleButton(w, h, 'style'),
  clickAction: (_seaBlock) => {
    // seaBlock.toggleMenu()
    // seaBlock.rebuildControls()
  },
}
