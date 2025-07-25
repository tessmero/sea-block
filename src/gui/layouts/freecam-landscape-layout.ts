/**
 * @file freecam-landscape-layout.ts
 *
 * Dual-joystick controls for mobile.
 */

import type { CssLayout } from 'util/layout-parser'
import { commonLayout, standards } from './layout-helper'
const { joy, pad } = standards

export const FREECAM_LANDSCAPE_LAYOUT = {
  ...commonLayout,

  leftJoy: { ...joy,
    bottom: pad,
  },
  rightJoy: { ...joy,
    bottom: pad,
    right: pad,
  },

} as const satisfies CssLayout
