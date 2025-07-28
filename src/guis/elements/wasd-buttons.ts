/**
 * @file wasd-buttons.ts
 *
 * Up/down/left/right buttons.
 */

import type { GuiElement } from 'guis/gui'
import type { KeyCode } from 'input-id'

export const wasdInputState = {
  upBtn: false,
  downBtn: false,
  leftBtn: false,
  rightBtn: false,
}

function wasdButton(
  layoutKey: string,
  direction: 'up' | 'down' | 'left' | 'right',
  hotkeys: ReadonlyArray<KeyCode>,
): GuiElement {
  return {
    display: { type: 'button', icon: `icons/16x16-arrow-${direction}.png` },
    layoutKey: layoutKey,
    hotkeys: hotkeys,
    // imageLoader: simpleButtonLoader(direction, '20px "Micro5"'),
    clickAction: (_seaBlock) => {
      wasdInputState[layoutKey] = true
    },
    unclickAction: (_seaBlock) => {
      wasdInputState[layoutKey] = false
    },
  }
}

export const wasdButtons: ReadonlyArray<GuiElement> = [
  wasdButton('upBtn', 'up', ['KeyW', 'ArrowUp']),
  wasdButton('downBtn', 'down', ['KeyS', 'ArrowDown']),
  wasdButton('leftBtn', 'left', ['KeyA', 'ArrowLeft']),
  wasdButton('rightBtn', 'right', ['KeyD', 'ArrowRight']),
]
