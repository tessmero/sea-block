/**
 * @file raft-portrait-layout.ts
 *
 * Layout for touch devices in portrait orientation.
 * Like free-cam with added buttons along top of screen.
 */

import type { CssLayout } from 'util/layout-parser'
import type { RaftLayoutKey } from 'guis/keys/raft-layout-keys'
import { standards } from '../layout-helper'
import { RAFT_COMMON_LAYOUT } from './raft-common-layout'
const { joy, pad, joySlider } = standards

export const RAFT_PORTRAIT_LAYOUT = {
  ...RAFT_COMMON_LAYOUT,

  leftJoy: { ...joy,
    bottom: pad,
  },

  leftJoySlider: {
    parent: 'leftJoy',
    ...joySlider,
    left: 'auto',
    top: 'auto',
  },

} as const satisfies CssLayout<RaftLayoutKey>
