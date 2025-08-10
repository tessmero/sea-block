/**
 * @file chess-debug-elements.ts
 *
 * Gui elements for debugging chess game.
 */

import type { GuiElement } from 'guis/gui'
import type { ChessPhase } from '../chess-enums'
import { CHESS_PHASES } from '../chess-enums'

// debug labels
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

export const CHESS_DEBUG_ELEMENTS = [
  ...Object.values(phaseLabels), // top center HUD
]

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
