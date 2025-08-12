/**
 * @file chess-reward-elements.ts
 *
 * Gui elements for the reward selection screen.
 * This screen has a separate layout from hud/dialogs.
 */

import type { GuiElement } from 'guis/gui'
import type { ChessButton } from './chess-button'
import { COLLECTIBLES } from '../chess-rewards'
import type { Chess } from '../chess-helper'
import { buildRewardChoiceDiagram } from '../chess-2d-gfx-helper'

let selectedReward: 'left' | 'right' | undefined = undefined

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
    if (selectedReward === 'left') {
      selectedReward = undefined
    }
    else {
      selectedReward = 'left'
    }
    updateRewardsDisplay(chess)

    // chess.collectReward(chess.leftReward)
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
    if (selectedReward === 'right') {
      selectedReward = undefined
    }
    else {
      selectedReward = 'right'
    }
    updateRewardsDisplay(chess)

    // chess.collectReward(chess.rightReward)
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

// covered when confirm button is visible
const bottomTitle: GuiElement = {
  layoutKey: 'confirmBtn',
  display: {
    type: 'label',
    // label: 'CHOOSE ONE',
  },
}

const confirmBtn: ChessButton = {
  layoutKey: 'confirmBtn',
  display: {
    type: 'button',
    label: 'ACCEPT',
    isVisible: false,
  },
  chessAction: ({ chess }) => {
    if (selectedReward === 'left') {
      chess.collectReward(chess.leftReward)
    }
    else {
      chess.collectReward(chess.rightReward)
    }
  },
}

const defaultTitle: GuiElement = {
  layoutKey: 'rewardsTitle',
  display: {
    type: 'label',
    label: 'CHOOSE ONE',
    // font: 'mini',
    // label: 'LEVEL CLEARED!',
  },
}

const collectibleTitles: Array<GuiElement>
  = Object.values(COLLECTIBLES).map(collectible =>
    ({
      layoutKey: 'rewardsTitle',
      display: {
        type: 'label',
        label: collectible.description,
        isVisible: false,
      },
    }))

export function resetRewardsDisplay(chess: Chess) {
  buildRewardChoiceDiagram(leftRewardDisplay, chess.leftReward)
  buildRewardChoiceDiagram(rightRewardDisplay, chess.rightReward)
  selectedReward = undefined
  updateRewardsDisplay(chess)
}

function updateRewardsDisplay(chess: Chess) {
  let cltIndex = -1
  leftRewardBtn.display.forcedState = undefined
  rightRewardBtn.display.forcedState = undefined
  confirmBtn.display.isVisible = false

  if (selectedReward === 'left') {
    cltIndex = Object.keys(COLLECTIBLES).indexOf(chess.leftReward)
    leftRewardBtn.display.forcedState = 'pressed'
    confirmBtn.display.isVisible = true
  }
  else if (selectedReward === 'right') {
    cltIndex = Object.keys(COLLECTIBLES).indexOf(chess.rightReward)
    rightRewardBtn.display.forcedState = 'pressed'
    confirmBtn.display.isVisible = true
  }
  for (const [i, elem] of collectibleTitles.entries()) {
    elem.display.isVisible = (i === cltIndex)
  }
  defaultTitle.display.isVisible = (cltIndex === -1)
  rewardsPanel.display.needsUpdate = true

  // for( const {display} of CHESS_REWARD_ELEMENTS ){
  //   display.needsUpdate = true
  // }
}

export const CHESS_REWARD_ELEMENTS = [
  rewardsPanel,
  defaultTitle, ...collectibleTitles,
  leftRewardBtn, leftRewardDisplay,
  rightRewardBtn, rightRewardDisplay,
  bottomTitle, confirmBtn,
] satisfies Array<GuiElement>
