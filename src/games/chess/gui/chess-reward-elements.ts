/**
 * @file chess-reward-elements.ts
 *
 * Gui elements for the reward selection screen.
 * This screen has a separate layout from hud/dialogs.
 */

import type { GuiElement } from 'guis/gui'
import type { ChessButton } from './chess-button'

const rewardsPanel: GuiElement = {
  layoutKey: 'rewardsPanel',
  display: {
    type: 'panel',
    // isVisible: false
  },
}
export const leftRewardBtn: ChessButton = {
  layoutKey: 'leftReward',
  display: {
    type: 'button',
    // isVisible: false,
  },
  chessAction: ({ chess }) => {
    chess.collectReward(chess.leftReward)
  },
}
export const leftRewardDisplay: GuiElement = {
  layoutKey: 'leftRewardDisplay',
  isPickable: false,
  display: {
    type: 'diagram',
    label: 'chess-left-reward', // give imageset unique hash
    // isVisible: false,
  },
}
export const rightRewardBtn: ChessButton = {
  layoutKey: 'rightReward',
  display: {
    type: 'button',
    // isVisible: false,
  },
  chessAction: ({ chess }) => {
    chess.collectReward(chess.rightReward)
  },
}
export const rightRewardDisplay: GuiElement = {
  layoutKey: 'rightRewardDisplay',
  isPickable: false,
  display: {
    type: 'diagram',
    label: 'chess-right-reward', // give imageset unique hash
    // isVisible: false,
  },
}

export const CHESS_REWARD_ELEMENTS = [
  rewardsPanel,
  leftRewardBtn, leftRewardDisplay,
  rightRewardBtn, rightRewardDisplay,
]
