/**
 * @file settings-gui-layout.ts
 *
 * Elements visible when settings menu is active.
 */

import type { CssLayout } from 'util/layout-parser'
import { optionLayout } from 'guis/elements/option-selector'
import { standards } from './layout-helper'

const { btn } = standards

export const SETTINGS_GUI_LAYOUT = {

  // screen: {}, // rectangle that fills screen

  backPanel: {
    width: 128,
    height: 128,
    // left: 0,
    // top: 16,
    left: 'auto',
    top: 'auto',
  },

  closeBtn: {
    parent: 'backPanel',
    ...btn,
    right: 0,
  },

  styleOption: {
    parent: 'backPanel',
    ...optionLayout,
    top: 16,
    left: 'auto',
  },

  tilingOption: {
    parent: 'backPanel',
    ...optionLayout,
    top: 40,
    left: 'auto',
  },

  generatorOption: {
    parent: 'backPanel',
    ...optionLayout,
    top: 64,
    left: 'auto',
  },

  layoutOption: {
    parent: 'backPanel',
    ...optionLayout,
    top: 88,
    left: 'auto',
  },

  debugBtn: {
    parent: 'backPanel',
    ...btn,
    bottom: 0,
  },

} as const satisfies CssLayout
