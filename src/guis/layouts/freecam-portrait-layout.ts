/**
 * @file freecam-portrait-layout.ts
 *
 * Similar to desktop layout, but with a joystick
 * at bottom-left instead of WASD buttons.
 */

import type { CssLayout } from 'util/layout-parser'
import { standards } from './layout-helper'
import { COMMON_LAYOUT } from './common-layout'
const { joy, pad, joySlider } = standards

export const FREECAM_PORTRAIT_LAYOUT = {
  ...COMMON_LAYOUT,

  leftJoy: { ...joy,
    bottom: pad,
  },

  leftJoySlider: {
    parent: 'leftJoy',
    ...joySlider,
    left: 'auto',
    top: 'auto',
  },

} as const satisfies CssLayout
