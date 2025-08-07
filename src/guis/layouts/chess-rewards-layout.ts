/**
 * @file chess-rewards-layout.ts
 *
 * Chess reward selection screen, visible after reaching
 * a stage's chest.
 */

import type { CssLayout } from 'util/layout-parser'
import { standards } from './layout-helper'
const { btn } = standards

export const CHESS_REWARDS_LAYOUT = {

  // rewards selection dialog
  rewardsPanel: {
    width: 5 * 16,
    height: 5 * 16,
    left: 'auto',
    top: 'auto',
  },
  rewardsInner: {
    parent: 'rewardsPanel',
    margin: 8,
  },
  leftReward: {
    parent: 'rewardsInner',
    width: 32,
  },
  leftRewardDisplay: {
    parent: 'leftReward',
    ...btn, left: 'auto', top: 'auto',
  },
  rightReward: {
    parent: 'rewardsInner',
    width: 32,
    right: 0,
  },
  rightRewardDisplay: {
    parent: 'rightReward',
    ...btn, left: 'auto', top: 'auto',
  },

} as const satisfies CssLayout
