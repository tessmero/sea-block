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

const point = {
  width: 0,
  height: 0,
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

  // 2027-08-03 start chess game
  chessBtn: { ...btn,
    top: pad,
    right: btn.width + 2 * pad,
  },

  // anchor mesh on screen after fiding mesh in free-cam world
  grabbedMesh: {
    ...point,

    'left@landscape': '33%',
    'top@landscape': 'auto',

    'left@portrait': 'auto',
    'top@portrait': '33%',
  },

  // dialog to start mini-game
  sgpAnchor: { // center of panel
    ...point,

    'left@landscape': '67%',
    'top@landscape': 'auto',

    'left@portrait': 'auto',
    'top@portrait': '67%',
  },
  grabbedMeshPanel: {
    parent: 'sgpAnchor',
    width: 16 * 5,
    height: 16 * 5,
    left: 'auto',
    top: 'auto',
  },
  grabbedMeshDiagram: {
    parent: 'grabbedMeshPanel',
    top: 8,
    width: -16,
    left: 'auto',
    height: 40,
  },
  grabbedMeshPlayButton: {
    parent: 'grabbedMeshPanel',
    width: 64,
    height: 20,
    left: 'auto',
    bottom: 28,
  },
  grabbedMeshCancelButton: {
    parent: 'grabbedMeshPanel',
    width: 64,
    height: 20,
    left: 'auto',
    bottom: 8,
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
