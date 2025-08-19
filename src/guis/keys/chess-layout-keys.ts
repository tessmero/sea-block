/**
 * @file chess-layout-keys.ts
 *
 * Names for rectangles in chess guis.
 */

export const CHESS_LAYOUT_KEYS = [
  'topBar', 'topLeftDisplay', 'topCenterDisplay', 'topRightBtn',
  'phaseLabel',

  'bottomLeft',

  'currentPieceButton', 'currentPieceIcon', 'currentPieceLabel',
  'switchPieceHint',

  'pawnBtn', 'cancelPawnBtn',
  'pawnHint',

  'flatViewport',

  'pauseMenuPanel', 'pauseMenuInner',
  'resumeBtn',
  'resetBtn',
  'quitBtn',

  'rewardsPanel', 'rewardsInner',
  'rewardsTitle',
  'leftReward', 'leftRewardDisplay', 'leftRewardHelpBtn',
  'rightReward', 'rightRewardDisplay', 'rightRewardHelpBtn',
  'confirmBtn',
  // Help panel and diagram keys
  'rewardHelpPanel', 'rewardHelpDiagram', 'rewardHelpCloseBtn',
  // Help panel and diagram keys
  'pieceHelpPanel', 'pieceHelpDiagram', 'pieceHelpCloseBtn',
] as const

export type ChessLayoutKey = (typeof CHESS_LAYOUT_KEYS)[number]
