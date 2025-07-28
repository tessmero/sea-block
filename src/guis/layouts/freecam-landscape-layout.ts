/**
 * @file freecam-landscape-layout.ts
 *
 * Dual-joystick controls for mobile.
 */

import type { CssLayout } from 'util/layout-parser'
import { standards } from './layout-helper'
import { FREECAM_PORTRAIT_LAYOUT } from './freecam-portrait-layout'
const { joy, joySlider, pad } = standards

export const FREECAM_LANDSCAPE_LAYOUT = {
  ...FREECAM_PORTRAIT_LAYOUT,

  rightJoy: { ...joy,
    bottom: pad,
    right: pad,
  },

  rightJoySlider: {
    parent: 'rightJoy',
    ...joySlider,
    left: 'auto',
    top: 'auto',
  },

} as const satisfies CssLayout
