/**
 * @file sprite-atlas-gui-layout.ts
 *
 * Draggable display panel and vertical scroll bar.
 */

import type { CssLayout } from 'util/layout-parser'

const titleBarThickness = 16
const scrollBarThickness = 16

export const SPRITE_ATLAS_GUI_LAYOUT = {

  backPanel: {
    // width: fullWidth,
    // height: fullHeight,

    // left: 'auto',
    // top: 'auto',
    // left: 0,
    // top: 16,
  },

  titleBar: {
    parent: 'backPanel',
    height: titleBarThickness,
  },

  titleBarLabel: {
    parent: 'titleBar',
    width: -titleBarThickness,
  },

  closeBtn: {
    parent: 'titleBar',
    width: titleBarThickness,
    right: 0,
  },

  // region under title bar
  _main: {
    parent: 'backPanel',
    height: -titleBarThickness,
    bottom: 0,
  },

  viewPanel: {
    parent: '_main',
    width: -scrollBarThickness,
  },

  scrollBar: {
    parent: '_main',
    width: scrollBarThickness,
    right: 0,
    bottom: 0,
  },

  scrollBarSlider: {
    parent: 'scrollBar',
    width: scrollBarThickness,
    height: 2 * scrollBarThickness,
  },

} as const satisfies CssLayout
