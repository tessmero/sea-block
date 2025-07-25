/**
 * @file settings-menu-layout.ts
 *
 * Elements visible when settings menu is active.
 */

import type { CssLayout } from 'util/layout-parser'

export const SETTINGS_MENU_LAYOUT = {

  backPanel: {
    width: 64,
    height: 64,
    left: 'auto',
    top: 'auto',
  },

  styleBtn: {
    parent: 'backPanel',
    width: 64,
    height: 16,
  },

} as const satisfies CssLayout
