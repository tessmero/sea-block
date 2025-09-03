/**
 * @file raft-desktop-layout.ts
 *
 * Layout for desktop devices using wASD/arrow controls.
 * Like free-cam with added buttons along top of screen.
 */

import type { CssLayout } from 'util/layout-parser'
import { RAFT_COMMON_LAYOUT } from './raft-common-layout'
import { WASD_LAYOUT } from '../wasd-layout'

export const RAFT_DESKTOP_LAYOUT = {
  ...RAFT_COMMON_LAYOUT,
  ...WASD_LAYOUT, // arrows on bottom left
} as const satisfies CssLayout
