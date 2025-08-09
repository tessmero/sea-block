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
import { clearChessRun, clickChess, getChessPhase, moveChess } from 'games/chess/chess-helper'
import { getImage } from 'gfx/2d/image-asset-loader'
import { CHESS_LAYOUT } from 'guis/layouts/chess-layout'
import type { ProcessedSubEvent } from 'mouse-touch-input'
import { CHESS_REWARDS_LAYOUT } from 'guis/layouts/chess-rewards-layout'
import { SeamlessTransition } from 'gfx/transitions/imp/seamless-transition'
import { Transition } from 'gfx/transitions/transition'
import { CAMERA } from 'settings'

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
    clearChessRun()
    const { seaBlock } = event
    const item = seaBlock.config.tree.children.game
    item.value = 'free-cam'
    SeamlessTransition.desiredCameraOffset.copy(CAMERA)
    SeamlessTransition.snapshotTerrain(seaBlock)
    seaBlock.startTransition({
      transition: Transition.create('seamless', seaBlock),
    })
    seaBlock.onCtrlChange(item)

    // togglePauseMenu(event)
  },
}

const pauseMenuPanel: GuiElement = {
  layoutKey: 'pauseMenuPanel',
  display: {
    type: 'panel',
    isVisible: false,
  },
}

const resetBtn: GuiElement = {
  layoutKey: 'resetBtn',
  display: {
    type: 'button',
    label: 'reset level',
    isVisible: false,
  },
}
const resumeBtn: GuiElement = {
  layoutKey: 'resumeBtn',
  display: {
    type: 'button',
    label: 'resume',
    isVisible: false,
  },
  clickAction: (event) => {
    togglePauseMenu(event)
  },
}
const quitBtn: GuiElement = {
  layoutKey: 'quitBtn',
  display: {
    type: 'button',
    label: 'quit chess',
    isVisible: false,
  },
}

const pauseMenuElements = [
  pauseMenuPanel, resetBtn, resumeBtn, quitBtn,
]

let isPauseMenuVisible = false
function togglePauseMenu(event: ElementEvent) {
  isPauseMenuVisible = !isPauseMenuVisible
  for (const { display } of pauseMenuElements) {
    display.isVisible = isPauseMenuVisible
    display.needsUpdate = true
  }
  event.seaBlock.layeredViewport.handleResize(event.seaBlock)
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
export const rewardChoiceElements = [rewardsPanel,
  leftRewardBtn, leftRewardDisplay,
  rightRewardBtn, rightRewardDisplay,
]

export const goalDisplays = [topLeftA.display, topLeftB.display]
// export const movesDisplay = helpElement.display
export const flatViewportDisplay = flatViewport.display

export class ChessGui extends Gui {
  static {
    Gui.register('chess', {
      factory: () => new ChessGui(),
      allLayouts: [CHESS_LAYOUT, CHESS_REWARDS_LAYOUT],
      layoutFactory: () => {
        if (getChessPhase() === 'reward-choice') {
          return CHESS_REWARDS_LAYOUT
        }
        return CHESS_LAYOUT
      },
      elements: [
        topLeftA, topLeftB, // top left HUD
        ...Object.values(phaseLabels), // top center HUD
        topRightBtn, // top right HUD
        switchPieceHint, // bottom left hint
        currentPiece, ...pieceLabels, pieceIcon, // bottom left HUD
        pawnHint, // bottom right hint
        pawnBtn, // bottom right HUD
        // helpPanel, helpElement, // bottom left dialog
        flatViewport, // after collecting dual-vector-foil
        ...rewardChoiceElements, // after reaching chest
        ...pauseMenuElements,
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
    else {
      super.clickElem(elem, event) // allow regular buttons with clickAction to work
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
