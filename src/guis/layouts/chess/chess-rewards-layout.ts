/**
 * @file chess-rewards-layout.ts
 *
 * Chess reward selection screen after clearing stage.
 */

import type { CssLayout } from 'util/layout-parser'
import { standards } from '../layout-helper'
import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'
import { CHESS_REWARD_HELP_LAYOUT } from './chess-reward-help-layout'
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
  leftRewardHelpBtn: {
    parent: 'rewardsPanel', // 'leftReward',
    ...btn,
    right: 0,
    // left: 'auto',
    // bottom: 0,
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
  rightRewardHelpBtn: {
    parent: 'rewardsPanel', // 'rightReward',
    ...btn,
    right: 0,
    // left: 'auto',
    // bottom: 0,
  },

  confirmBtn: {
    parent: 'rewardsInner',
    height: 20,
    bottom: 0,
  },

  ...CHESS_REWARD_HELP_LAYOUT,

} as const satisfies CssLayout<ChessLayoutKey>
