/**
 * @file raft-build-layout.ts
 *
 * Raft builder with placable part buttons along bottom.
 */

import type { CssLayout } from 'util/layout-parser'

const nButtons = 2 // row of buttons at bottom center
const btnHeight = 16
const btnWidth = 64
export const RAFT_BUILD_LAYOUT = {
  phaseLabel: {
    height: 16,
    width: 100,
    left: 'auto',
  },

  driveBtn: {
    width: btnWidth,
    height: btnHeight,
    bottom: 0,
    right: 0,
  },

  bottomBar: {
    height: btnHeight,
    width: btnWidth * nButtons,
    bottom: 0,
    left: 'auto',
  },

  // row of n buttons starting with 'button0'
  ...Object.fromEntries(
    Array.from({ length: nButtons }, (_, i) => [
      `button${i}`, {
        parent: 'bottomBar',
        width: btnWidth,
        left: i * btnWidth,
      },
    ]),
  ),

} as const satisfies CssLayout
