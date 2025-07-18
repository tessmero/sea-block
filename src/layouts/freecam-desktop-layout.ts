/**
 * @file freecam-desktop-layout.ts
 *
 * WASD controls on bottom-left for free-cam game.
 */

import type { CssLayout } from '../util/layout-parser'

const btnSize = 15
const pad = 1
const wasdBtn = {
  parent: '_wasdBtnRegion',
  width: btnSize,
  height: btnSize,
}

export const FREECAM_DESKTOP_LAYOUT = {
  _wasdBtnRegion: {
    width: 3 * btnSize + 2 * pad,
    height: 2 * btnSize + pad,
    bottom: pad,
    left: pad,
  },

  upBtn: { ...wasdBtn,
    left: 'auto',
  },

  downBtn: { ...wasdBtn,
    left: 'auto',
    bottom: 0,
  },

  leftBtn: { ...wasdBtn,
    bottom: 0,
  },

  rightBtn: { ...wasdBtn,
    right: 0,
    bottom: 0,
  },

} as const satisfies CssLayout
