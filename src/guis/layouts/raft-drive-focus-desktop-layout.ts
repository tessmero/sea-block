/**
 * @file raft-drive-focus-desktop-layout.ts
 *
 * Confirm/exit button on bottom right when camera is locked
 * on raft in raft-drive game.
 */

import type { CssLayout } from 'util/layout-parser'
import { FREECAM_DESKTOP_LAYOUT } from './freecam-desktop-layout'

export const RAFT_DRIVE_FOCUS_DESKTOP_LAYOUT = {
  ...FREECAM_DESKTOP_LAYOUT,

  doneBtn: {
    width: 64,
    height: 16,
    bottom: 0,
    right: 0,
  },
} as const satisfies CssLayout
