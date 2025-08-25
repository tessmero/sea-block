/**
 * @file raft-landscape-layout.ts
 *
 * Dual-joystick layout for touch devices in landscape orientation.
 * Also used for desktop devices with active gamepad input.
 * Like free-cam with added buttons along top of screen.
 */

import type { CssLayout } from 'util/layout-parser'
import type { RaftLayoutKey } from 'guis/keys/raft-layout-keys'
import { RAFT_PORTRAIT_LAYOUT } from './raft-portrait-layout'
import { standards } from '../layout-helper'
const { joy, pad, joySlider } = standards

export const RAFT_LANDSCAPE_LAYOUT = {
  ...RAFT_PORTRAIT_LAYOUT,

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

} as const satisfies CssLayout<RaftLayoutKey>
