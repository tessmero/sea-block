/**
 * @file freecam-desktop-layout.ts
 *
 * WASD controls on bottom-left for free-cam game.
 */

import type { CssLayout, CssRuleset } from 'util/layout-parser'
import { standards } from './layout-helper'
import { COMMON_LAYOUT } from './common-layout'
import type { FreecamLayoutKey } from 'guis/keys/freecam-layout-keys'

const { btn, btnSize, pad } = standards

const wasdBtn = {
  parent: '_wasdBtnRegion',
  ...btn,
} as const satisfies CssRuleset<FreecamLayoutKey>

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

} as const satisfies CssLayout<FreecamLayoutKey>
