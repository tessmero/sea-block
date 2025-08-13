/**
 * @file freecam-desktop-layout.ts
 *
 * WASD controls on bottom-left for free-cam game.
 */

import type { CssLayout } from 'util/layout-parser'
import { standards } from './layout-helper'
import { COMMON_LAYOUT } from './common-layout'

const { btn, btnSize, pad } = standards

const wasdBtn = {
  parent: '_wasdBtnRegion',
  ...btn,
}

export const FREECAM_DESKTOP_LAYOUT = {

  ...COMMON_LAYOUT,

  // WASD / arrows on bottom left
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
