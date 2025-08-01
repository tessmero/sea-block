/**
 * @file layout-helper.ts
 *
 * Guidelines and common components for gui layouts.
 */

import { parseLayoutRectangles, type CssLayout, type CssRuleset } from 'util/layout-parser'
import type { GuiElement } from 'guis/gui'

// padding between buttons
const pad = 0

// standard small square button
const btnSize = 16
const btn = {
  width: btnSize,
  height: btnSize,
}

// touch region for a virtual joystick
const joySize = 48
const joy = {
  width: joySize,
  height: joySize,
  // 'max-width': '50%', // prevent dual joysticks from overlapping
} satisfies CssRuleset

// moving element inside of virtual joystick region
const joySlider = {
  width: 24,
  height: 24,
} satisfies CssRuleset

export const standards = {
  btnSize, pad, btn,
  joySize, joy, joySlider,
} as const

// common buttons at top of screen
export const commonLayout = {

  // 2027-08-01 show sprite atlas test gui
  spritAtlasBtn: {
    ...btn,
    width: 5 * btn.width,
    left: 'auto',
  },

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

// used to preload elements for guis that may switch layout modes
export function getElementDims(
  elements: Array<GuiElement>,
  layouts: Array<CssLayout>,
): Record<string, { w: number, h: number }> {
  const result: Record<string, { w: number, h: number }> = {}

  // make up big container dimensions (shouldn't effect element dimensions)
  const container = { x: 0, y: 0, w: 1000, h: 1000 }

  for (const lyt of layouts) {
    const rectangles = parseLayoutRectangles(container, lyt)

    for (const { layoutKey: key } of elements) {
      const rect = rectangles[key]
      if (rect) {
        const { w, h } = rect
        if (key in result) {
          if (result[key].w !== w || result[key].h !== h) {
            throw new Error(`got multiple dims for element with layout key ${key}`)
          }
        }
        else {
          result[key] = { w, h }
        }
      }
    }
  }

  return result
}
