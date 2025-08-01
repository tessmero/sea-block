/**
 * @file start-sequence-layout.ts
 *
 * Skip button for start sequence.
 */

import type { CssLayout } from 'util/layout-parser'
import { standards } from './layout-helper'
const { pad } = standards

export const START_SEQUENCE_LAYOUT = {
  skip: {
    width: 48,
    height: 16,
    right: pad,
    bottom: pad,
  },
} as const satisfies CssLayout
