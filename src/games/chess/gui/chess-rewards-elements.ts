/**
 * @file chess-rewards-elements.ts
 *
 * Gui elements for the reward selection screen.
 * This screen has a separate layout from hud/dialogs.
 */

import type { GuiElement } from 'guis/gui'
import type { ChessButton } from './chess-button'
import { COLLECTIBLES } from '../chess-rewards'
import type { Chess } from '../chess-helper'
import { buildRewardChoiceDiagram } from '../gfx/chess-2d-gfx-helper'
import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'
import { toggleRewardHelp } from './chess-reward-help-elements'

let selectedReward: 'left' | 'right' | undefined = undefined

type ChessElem = GuiElement<ChessLayoutKey>

const rewardsPanel: ChessElem = {
  layoutKey: 'rewardsPanel',
  display: {
    type: 'panel',
    // isVisible: false
  },
}
export const leftRewardBtn: ChessButton = {
  layoutKey: 'leftReward',
  gamepadNavBox: 'leftReward',
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
export const leftRewardDisplay: ChessElem = {
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
  gamepadNavBox: 'rightReward',
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
export const rightRewardDisplay: ChessElem = {
  layoutKey: 'rightRewardDisplay',
  isPickable: false,
  display: {
    type: 'diagram',
    label: 'chess-right-reward', // give imageset unique hash
    // isVisible: false,
  },
}
export const leftRewardHelpBtn: ChessButton = {
  layoutKey: 'leftRewardHelpBtn',
  display: {
    type: 'button',
    label: '?',
    isVisible: false,
  },
  chessAction: ({ chess }) => toggleRewardHelp(chess, 'left'),
}
export const rightRewardHelpBtn: ChessButton = {
  layoutKey: 'rightRewardHelpBtn',
  display: {
    type: 'button',
    label: '?',
    isVisible: false,
  },
  chessAction: ({ chess }) => toggleRewardHelp(chess, 'right'),
}

// covered when confirm button is visible
const bottomTitle: ChessElem = {
  layoutKey: 'confirmBtn',
  display: {
    type: 'label',
    // label: 'CHOOSE ONE',
  },
}

export const acceptBtn: ChessButton = {
  layoutKey: 'confirmBtn',
  gamepadNavBox: 'confirmBtn',
  display: {
    type: 'button',
    label: 'ACCEPT',
    isVisible: false,
  },
  chessAction: ({ chess }) => {
    toggleRewardHelp(chess)
    if (selectedReward === 'left') {
      chess.collectReward(chess.leftReward)
    }
    else {
      chess.collectReward(chess.rightReward)
    }
  },
}

const defaultTitle: ChessElem = {
  layoutKey: 'rewardsTitle',
  display: {
    type: 'label',
    label: 'CHOOSE ONE',
    // font: 'mini',
    // label: 'LEVEL CLEARED!',
  },
}

const collectibleTitles: Array<ChessElem>
  = Object.values(COLLECTIBLES).map(collectible =>
    ({
      layoutKey: 'rewardsTitle',
      display: {
        type: 'label',
        label: collectible.title,
        isVisible: false,
      },
    }))

export function resetRewardsDisplay(chess: Chess) {
  buildRewardChoiceDiagram(leftRewardDisplay, chess.leftReward)
  buildRewardChoiceDiagram(rightRewardDisplay, chess.rightReward)
  selectedReward = undefined
  updateRewardsDisplay(chess)
}

function updateHelpBtnVisibility() {
  // leftRewardHelpBtn.display.isVisible = leftRewardBtn.display.forcedState === 'pressed'
  // rightRewardHelpBtn.display.isVisible = rightRewardBtn.display.forcedState === 'pressed'
}

function updateRewardsDisplay(chess: Chess) {
  let cltIndex = -1
  leftRewardBtn.display.forcedState = undefined
  rightRewardBtn.display.forcedState = undefined
  acceptBtn.display.isVisible = false

  if (selectedReward === 'left') {
    cltIndex = Object.keys(COLLECTIBLES).indexOf(chess.leftReward)
    leftRewardBtn.display.forcedState = 'pressed'
    acceptBtn.display.isVisible = true
  }
  else if (selectedReward === 'right') {
    cltIndex = Object.keys(COLLECTIBLES).indexOf(chess.rightReward)
    rightRewardBtn.display.forcedState = 'pressed'
    acceptBtn.display.isVisible = true
  }
  for (const [i, elem] of collectibleTitles.entries()) {
    elem.display.isVisible = (i === cltIndex)
  }
  defaultTitle.display.isVisible = (cltIndex === -1)
  rewardsPanel.display.needsUpdate = true

  updateHelpBtnVisibility()
  // for( const {display} of CHESS_REWARD_ELEMENTS ){
  //   display.needsUpdate = true
  // }
}

export const CHESS_REWARD_ELEMENTS = [
  rewardsPanel,
  defaultTitle, ...collectibleTitles,
  leftRewardBtn, leftRewardDisplay, leftRewardHelpBtn,
  rightRewardBtn, rightRewardDisplay, rightRewardHelpBtn,
  bottomTitle, acceptBtn,
] satisfies Array<ChessElem>
