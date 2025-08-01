/**
 * @file splash-screen-layout.ts
 *
 * Launch/start button in middle in screen.
 */

import type { CssLayout } from 'util/layout-parser'

export const SPLASH_SCREEN_LAYOUT = {
  launch: {
    width: 64,
    height: 32,
    left: 'auto',
    top: 'auto',
  },
} as const satisfies CssLayout
