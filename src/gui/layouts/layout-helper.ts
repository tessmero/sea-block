/**
 * @file layout-helper.ts
 *
 * Guidelines and common components for gui layouts.
 */

import type { CssLayout, CssRuleset } from 'util/layout-parser'

// padding between buttons
const pad = 0

// standard small square button
const btnSize = 16
const btn = {
  width: btnSize,
  height: btnSize,
}

// touch region for a virtual joystick
const joySize = 64
const joy = {
  width: joySize,
  height: joySize,
  // 'max-width': '50%', // prevent dual joysticks from overlapping
} satisfies CssRuleset

export const standards = {
  btnSize, pad, btn,
  joySize, joy,
} as const

// common buttons at top of screen
export const commonLayout = {

  // config on top left
  configBtn: { ...btn,
    top: pad,
    left: pad,
  },

  // play/stop on top right
  musicBtn: { ...btn,
    top: pad,
    right: pad,
  },

} as const satisfies CssLayout
