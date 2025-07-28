/**
 * @file sprite-atlas-gui-layout.ts
 *
 * Draggable display panel and vertical scroll bar.
 */

import type { CssLayout } from 'util/layout-parser'

export const SPRITE_ATLAS_GUI_LAYOUT = {

  backPanel: {
    width: 128,
    height: 128,
    left: 0,
    top: 16,
  },

  draggablePanel: {
    parent: 'backPanel',
    width: 100,
  },

  scrollBar: {
    parent: 'backPanel',
    width: 10,
    right: 0,
  },

  scrollBarSlider: {
    parent: 'scrollBar',
    width: 10,
    height: 20,
  },

} as const satisfies CssLayout
