/**
 * @file chess-reward-help-layout.ts
 *
 * Description for one collectible item, included in chess rewards layout.
 */

import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'
import { standards } from '../layout-helper'
const { btn } = standards

import type { CssLayout } from 'util/layout-parser'

export const CHESS_REWARD_HELP_LAYOUT = {

  // Help panel overlays
  rewardHelpPanel: {
    parent: 'rewardsPanel',
    // left: 0,
    // top: 0,
    // width: 5 * 16,
    // height: 4 * 16,
    // // covers all except acceptBtn
  },
  rewardHelpDiagram: {
    parent: 'rewardHelpPanel',
    margin: 8,
    width: 5 * 16 - 16,
    height: 6 * 16 - 32,
    top: 16,
  },
  rewardHelpCloseBtn: {
    parent: 'rewardsPanel', // 'rewardHelpPanel',
    ...btn,
    right: 0,
  },
} as const satisfies CssLayout<ChessLayoutKey>
