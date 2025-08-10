/**
 * @file chess-hud-elements.ts
 *
 * Flat gui elements for the chess game HUD.
 */

import type { GuiElement } from 'guis/gui'
import type { PieceName } from '../chess-enums'
import { PIECE_NAMES } from '../chess-enums'
import { getImage } from 'gfx/2d/image-asset-loader'
import { buildGoalDiagram } from '../chess-diagrams'
import { togglePauseMenu } from './chess-dialog-elements'
import type { ChessButton } from './chess-button'

// 2D chess game view
export const flatViewport: GuiElement = {
  layoutKey: 'flatViewport',
  isPickable: false,
  display: {
    type: 'diagram',
    label: 'chess-flat-viewport', // give imageset unique hash
    isVisible: false,
  },
}

// const helpPanel: GuiElement = {
//   layoutKey: 'helpPanel',
//   display: { type: 'panel', isVisible: false },
// }

const switchPieceHint: GuiElement = {
  layoutKey: 'switchPieceHint',
  display: {
    type: 'label',
    label: 'Switch Piece',
    shouldClearBehind: true,
  },
}

const pawnHint: GuiElement = {
  layoutKey: 'pawnHint',
  display: {
    type: 'label',
    label: 'Place Pawn',
    shouldClearBehind: true,
  },
}

// top left display with two frames
const topLeftA: GuiElement = {
  layoutKey: 'topLeftDisplay',
  display: {
    type: 'diagram',
    label: 'chess-goal-a', // give imageset unique hash
    shouldClearBehind: true,
  },
}
const topLeftB: GuiElement = {
  layoutKey: 'topLeftDisplay',
  display: {
    type: 'diagram',
    label: 'chess-goal-b', // give imageset unique hash
    shouldClearBehind: true,
    isVisible: false,
  },
}

const topRightBtn: GuiElement = {
  layoutKey: 'topRightBtn',
  display: {
    type: 'button',
    icon: 'icons/16x16-x.png',
  },
  clickAction: (event) => {
    // clearChessRun()
    // const { seaBlock } = event
    // const item = seaBlock.config.tree.children.game
    // item.value = 'free-cam'
    // SeamlessTransition.desiredCameraOffset.copy(CAMERA)
    // SeamlessTransition.snapshotTerrain(seaBlock)
    // seaBlock.startTransition({
    //   transition: Transition.create('seamless', seaBlock),
    // })
    // seaBlock.onCtrlChange(item)

    togglePauseMenu(event.seaBlock)
  },
}

// const helpElement: GuiElement = {
//   layoutKey: 'movesDisplay',
//   display: {
//     type: 'diagram',
//     label: 'chess-piece-info', // give imageset unique hash
//     isVisible: false,
//   },
// }

// const prevPiece: ChessButton = {
//   layoutKey: 'prevPiece',
//   display: {
//     type: 'button',
//     icon: 'icons/16x16-arrow-left.png',
//   },
//   chessAction: ({ chess }) => {},
// }
// const nextPiece: ChessButton = {
//   layoutKey: 'nextPiece',
//   display: {
//     type: 'button',
//     icon: 'icons/16x16-arrow-right.png',
//   },
//   chessAction: ({ chess }) => {},
// }

const currentPiece: ChessButton = {
  layoutKey: 'currentPieceButton',
  display: { type: 'button' },
  chessAction: ({ chess }) => {
    chess.switchCurrentPiece()
  },
}

export function showCurrentPiece(piece: PieceName) {
  // hide labels
  for (const label of pieceLabels) {
    label.display.isVisible = false
  }

  // show one label
  const i = PIECE_NAMES.indexOf(piece)
  pieceLabels[i].display.isVisible = true

  // draw icon
  const buffer = pieceIcon.display.imageset?.default
  if (!buffer) {
    throw new Error('flat viewport diagram element has no buffer')
  }
  const img = getImage(`icons/chess/16x16-${piece}.png`)
  const ctx = buffer.getContext('2d') as OffscreenCanvasRenderingContext2D
  const { width, height } = buffer
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(img, (width - img.width) / 2, (height - img.height) / 2)

  // queue repaint for button, label, and icon
  currentPiece.display.needsUpdate = true

  // update top left goal dispaly
  buildGoalDiagram(piece)
}

const defaultPiece: PieceName = 'rook'
const pieceLabels: Array<GuiElement> = PIECE_NAMES.map(piece => ({
  layoutKey: 'currentPieceLabel',
  isPickable: false,
  display: {
    type: 'label',
    label: piece.toUpperCase(),
    font: 'default',
    textAlign: 'left',
    isVisible: piece === defaultPiece,
  },
}))

const pieceIcon: GuiElement = {
  layoutKey: 'currentPieceIcon',
  isPickable: false,
  display: {
    type: 'diagram',
    label: 'chess-current-piece-icon', // give unique imageset hash
  },
}

const pawnBtn: ChessButton = {
  layoutKey: 'pawnBtn',
  display: {
    type: 'button',
    icon: 'icons/chess/8x8-pawn.png',
  },
  chessAction: ({ chess }) => {
    chess.startPlacePawn()
  },
}

export const goalDisplays = [topLeftA.display, topLeftB.display]
// export const movesDisplay = helpElement.display
export const flatViewportDisplay = flatViewport.display

export const CHESS_HUD_ELEMENTS = [
  topLeftA, topLeftB, // top left HUD
  topRightBtn, // top right HUD
  switchPieceHint, // bottom left hint
  currentPiece, ...pieceLabels, pieceIcon, // bottom left HUD
  pawnHint, // bottom right hint
  pawnBtn, // bottom right HUD
  // helpPanel, helpElement, // bottom left dialog
  flatViewport, // after collecting dual-vector-foil
]
