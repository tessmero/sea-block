/**
 * @file chess-gui.ts
 *
 * Chess HUD with help button that shows current piece info.
 * Also passes input events to src/games/chess/chess-helper,
 * so user can click on the chess board.
 */

import { buildGoalDiagram } from 'games/chess/chess-diagrams'
import type { ElementEvent, GuiElement, StaticElement } from '../gui'
import { Gui } from '../gui'
import type { ChessPhase, PieceName } from 'games/chess/chess-enums'
import { CHESS_PHASES, PIECE_NAMES } from 'games/chess/chess-enums'
import type { Chess } from 'games/chess/chess-helper'
import { clickChess, moveChess } from 'games/chess/chess-helper'
import { getImage } from 'gfx/2d/image-asset-loader'
import { CHESS_LAYOUT } from 'guis/layouts/chess-layout'
import type { ProcessedSubEvent } from 'mouse-touch-input'
import type { SeaBlock } from 'sea-block'

const defaultPhase: ChessPhase = 'player-choice'
const defaultPiece: PieceName = 'rook'

const phaseLabels = Object.fromEntries(
  CHESS_PHASES.map(phase => [
    phase,
    {
      layoutKey: 'phaseLabel',
      display: {
        type: 'panel',
        label: phase,
        // font: 'mini',
        isVisible: phase === defaultPhase,
      },
    } as GuiElement,
  ]),
) as Record<ChessPhase, GuiElement>

export function showPhaseLabel(phase: ChessPhase) {
  for (const key of CHESS_PHASES) {
    const { display } = phaseLabels[key]
    if (key === phase) {
      display.isVisible = true
      display.needsUpdate = true
    }
    else {
      display.isVisible = false
    }
  }
}

// button in chess gui
export interface ChessButton extends StaticElement {
  chessAction: (event: ChessButtonEvent) => void // like clickAction
}
export interface ChessButtonEvent extends ElementEvent {
  chess: Chess
}

// 2D chess game view
export const flatViewport: GuiElement = {
  layoutKey: 'flatViewport',
  display: {
    type: 'diagram',
    label: 'chess-flat-viewport', // give imageset unique hash
    isVisible: false,
  },
}

const helpPanel: GuiElement = {
  layoutKey: 'helpPanel',
  display: { type: 'panel', isVisible: false },
}

const topLeftElem: GuiElement = {
  layoutKey: 'topLeftDisplay',
  display: {
    type: 'diagram',
    label: 'chess-goal', // give imageset unique hash
    shouldClearBehind: true,
  },
}

const quitBtn: GuiElement = {
  layoutKey: 'topRightBtn',
  display: {
    type: 'button',
    icon: 'icons/16x16-x.png',
  },
}

const helpElement: GuiElement = {
  layoutKey: 'movesDisplay',
  display: {
    type: 'diagram',
    label: 'chess-piece-info', // give imageset unique hash
    isVisible: false,
  },
}

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

const rewardsPanel: GuiElement = {
  layoutKey: 'rewardsPanel',
  display: { type: 'panel', isVisible: false },
}
export const leftRewardBtn: ChessButton = {
  layoutKey: 'leftReward',
  display: {
    type: 'button',
    isVisible: false,
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
    isVisible: false,
  },
}
export const rightRewardBtn: ChessButton = {
  layoutKey: 'rightReward',
  display: {
    type: 'button',
    isVisible: false,
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
    isVisible: false,
  },
}
export const rewardChoiceElements = [rewardsPanel,
  leftRewardBtn, leftRewardDisplay,
  rightRewardBtn, rightRewardDisplay,
]

export const goalDisplay = topLeftElem.display
export const movesDisplay = helpElement.display
export const flatViewportDisplay = flatViewport.display

function toggleHelp(context: SeaBlock) {
  const isVisible = !helpPanel.display.isVisible
  helpPanel.display.isVisible = isVisible
  helpElement.display.isVisible = isVisible
  context.layeredViewport.handleResize(context)
}

export class ChessGui extends Gui {
  static {
    Gui.register('chess', {
      factory: () => new ChessGui(),
      layoutFactory: () => CHESS_LAYOUT,
      elements: [
        topLeftElem, // top left HUD
        ...Object.values(phaseLabels), // top center HUD
        quitBtn, // top right HUD
        currentPiece, ...pieceLabels, pieceIcon, // bottom left HUD
        pawnBtn, // bottom right HUD
        helpPanel, helpElement, // bottom left dialog
        flatViewport, // after collecting dual-vector-foil
        ...rewardChoiceElements, // after reaching chest
      ],
    })
  }

  public click(inputEvent: ProcessedSubEvent): boolean {
    let hasConsumed = super.click(inputEvent)
    if (!hasConsumed) {
      hasConsumed = clickChess(inputEvent)
    }
    return hasConsumed
  }

  private chess?: Chess
  public setChessInstance(chess: Chess) {
    this.chess = chess
  }

  protected clickElem(elem: GuiElement, event: ElementEvent): void {
    const { chess } = this
    if (chess && 'chessAction' in elem) {
      const btn = elem as ChessButton
      btn.chessAction({ ...event, chess })
    }
  }

  public move(inputEvent: ProcessedSubEvent): boolean {
    let hasConsumed = super.move(inputEvent)
    if (!hasConsumed) {
      // hover on 2d or 3d chess board
      hasConsumed = moveChess(inputEvent)
    }
    return hasConsumed
  }
}
