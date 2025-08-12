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
    height: 6 * 16,
    left: 'auto',
    top: 'auto',
  },
  rewardsInner: {
    parent: 'rewardsPanel',
    margin: 8,
  },
  rewardsTitle: {
    parent: 'rewardsInner',
    height: 20,
  },
  leftReward: {
    parent: 'rewardsInner',
    width: 32,
    height: 40,
    top: 'auto',
  },
  leftRewardDisplay: {
    parent: 'leftReward',
    ...btn, left: 'auto', top: 'auto',
  },
  rightReward: {
    parent: 'rewardsInner',
    width: 32,
    height: 40,
    top: 'auto',
    right: 0,
  },
  rightRewardDisplay: {
    parent: 'rightReward',
    ...btn, left: 'auto', top: 'auto',
  },

  confirmBtn: {
    parent: 'rewardsInner',
    height: 20,
    bottom: 0,
  },

} as const satisfies CssLayout
