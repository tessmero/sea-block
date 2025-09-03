/**
 * @file start-menu-layout.ts
 *
 * Banner and play button for start menu.
 */

import type { SmLayoutKey } from 'guis/keys/sm-layout-keys'
import type { CssLayout } from 'util/layout-parser'
// import { standards } from './layout-helper'
// const { pad } = standards

export const START_MENU_LAYOUT = {

  // flashing lights warning
  smText: {
    // middle of screen
  },

  _middle: {
    height: 0,
    top: 'auto',
  },

  // SEA BLOCK banner
  smBanner: {
    parent: '_middle',
    width: 80,
    height: 80,
    left: 'auto',
    top: -50,
  },

  smStartBtn: {
    parent: 'smBanner',
    width: 38,
    height: 16,
    left: 0,
    bottom: 0,
  },

  smSettingsBtn: {
    parent: 'smBanner',
    width: 38,
    height: 16,
    right: 0,
    bottom: 0,
  },
} as const satisfies CssLayout<SmLayoutKey>
