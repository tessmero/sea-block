/**
 * @file wasd-buttons.ts
 *
 * Up/down/left/right buttons that are loaded on startup.
 */

import type { GameElement } from 'games/game'
import { iconButtonLoader } from 'gfx/2d/flat-button'
import type { KeyCode } from 'input-id'

export const wasdInputState = {
  upBtn: false,
  downBtn: false,
  leftBtn: false,
  rightBtn: false,
}

function wasdButton(
  layoutKey: string,
  direction: string,
  hotkeys: ReadonlyArray<KeyCode>,
): GameElement {
  return {
    w: 16, h: 16,
    layoutKey: layoutKey,
    hotkeys: hotkeys,
    imageLoader: iconButtonLoader(
      'icons/16x16-btn-background.png',
      `icons/16x16-btn-arrow-${direction}.png`,
    ),
    // imageLoader: simpleButtonLoader(direction, '20px "Micro5"'),
    clickAction: (_seaBlock) => {
      wasdInputState[layoutKey] = true
    },
    unclickAction: (_seaBlock) => {
      wasdInputState[layoutKey] = false
    },
  }
}

export const wasdButtons: ReadonlyArray<GameElement> = [
  wasdButton('upBtn', 'up', ['KeyW', 'ArrowUp']),
  wasdButton('downBtn', 'down', ['KeyS', 'ArrowDown']),
  wasdButton('leftBtn', 'left', ['KeyA', 'ArrowLeft']),
  wasdButton('rightBtn', 'right', ['KeyD', 'ArrowRight']),
]
