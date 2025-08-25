/**
 * @file freecam-desktop-layout.ts
 *
 * WASD controls on bottom-left for free-cam game.
 */

import type { CssLayout } from 'util/layout-parser'
import { COMMON_LAYOUT } from './common-layout'
import type { FreecamLayoutKey } from 'guis/keys/freecam-layout-keys'
import { WASD_LAYOUT } from './wasd-layout'

export const FREECAM_DESKTOP_LAYOUT = {

  ...COMMON_LAYOUT,

  ...WASD_LAYOUT,

} as const satisfies CssLayout<FreecamLayoutKey>
