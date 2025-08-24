/**
 * @file raft-drive-focus-touch-layout.ts
 *
 * Confirm/exit button on bottom right when camera is locked
 * on raft in raft-drive game.
 */

import type { CssLayout } from 'util/layout-parser'
import { FREECAM_PORTRAIT_LAYOUT } from './freecam-portrait-layout'

export const RAFT_DRIVE_FOCUS_TOUCH_LAYOUT = {
  ...FREECAM_PORTRAIT_LAYOUT,

  doneBtn: {
    width: 64,
    height: 16,
    bottom: 0,
    right: 0,
  },

} as const satisfies CssLayout
