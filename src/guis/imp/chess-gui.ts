/**
 * @file chess-gui.ts
 *
 * Chess HUD with help button that shows current piece info.
 * Also passes input events to src/games/chess/chess-helper,
 * so user can click on the chess board.
 */

import type { GuiElement } from '../gui'
import { Gui } from '../gui'
import type { ChessPhase } from 'games/chess/chess-enums'
import { CHESS_PHASES } from 'games/chess/chess-enums'
import { clickChess, moveChess } from 'games/chess/chess-helper'
import { CHESS_LAYOUT } from 'guis/layouts/chess-layout'
import type { ProcessedSubEvent } from 'mouse-touch-input'
import type { SeaBlock } from 'sea-block'

const defaultPhase: ChessPhase = 'player-choice'

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

// 2D chess game view
export const flatViewport: GuiElement = {
  layoutKey: 'flatViewport',
  display: {
    type: 'diagram',
    label: 'chess-flat-viewport', // give imageset unique hash
    // isVisible: false,
  },
}

const helpPanel: GuiElement = {
  layoutKey: 'helpPanel',
  display: { type: 'panel', isVisible: false },
}

const helpElements: Array<GuiElement> = [
  {
    layoutKey: 'goalPanel',
    display: {
      type: 'diagram',
      label: 'chess-goal', // give imageset unique hash
    },
  },
  {
    layoutKey: 'pieceInfoPanel',
    display: {
      type: 'diagram',
      label: 'chess-piece-info', // give imageset unique hash
    },
  },
]
helpElements.forEach((elem) => {
  elem.display.isVisible = helpPanel.display.isVisible
})

export const goalDisplay = helpElements[0].display
export const movesDisplay = helpElements[1].display
export const flatViewportDisplay = flatViewport.display

function toggleHelp(context: SeaBlock) {
  const isVisible = !helpPanel.display.isVisible
  helpPanel.display.isVisible = isVisible
  for (const elem of helpElements) {
    elem.display.isVisible = isVisible
  }
  context.layeredViewport.handleResize(context)
}

export class ChessGui extends Gui {
  static {
    Gui.register('chess', {
      factory: () => new ChessGui(),
      layoutFactory: () => CHESS_LAYOUT,
      elements: [
        ...Object.values(phaseLabels),
        {
          layoutKey: 'helpBtn',
          display: { type: 'button', icon: 'icons/16x16-ellipsis.png' },
          clickAction: ({ seaBlock }) => { toggleHelp(seaBlock) },
        },
        helpPanel, ...helpElements,
        flatViewport,
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

  public move(inputEvent: ProcessedSubEvent): boolean {
    let hasConsumed = super.move(inputEvent)
    if (!hasConsumed) {
      // hover on 2d or 3d chess board
      hasConsumed = moveChess(inputEvent)
    }
    return hasConsumed
  }
}
