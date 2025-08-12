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

const point = {
  width: 0,
  height: 0,
} as const

export const standards = {
  btnSize, pad, btn, point,
  joySize, joy, joySlider,
} as const

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
