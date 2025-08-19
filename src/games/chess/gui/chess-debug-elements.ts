/**
 * @file chess-debug-elements.ts
 *
 * Gui elements for debugging chess game.
 */

import type { GuiElement } from 'guis/gui'
import type { ChessPhase } from '../chess-enums'
import { CHESS_PHASES } from '../chess-enums'
import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'

const userFriendlyLabels = {
  'player-anim': '...',
  'pawn-anim': '...',
  'enemy-anim': '...',
  'game-over': 'Game Over',
  'place-pawn': 'Place Pawn',
  'player-choice': 'Reach Treasure',
  'reached-chest': 'Level Cleared',
  'reward-choice': 'Select Reward',
} as const satisfies Record<ChessPhase, string>

// debug labels
const defaultPhase: ChessPhase = 'player-choice'
const phaseLabels = Object.fromEntries(
  CHESS_PHASES.map(phase => [
    phase,
    {
      layoutKey: 'phaseLabel',
      isPickable: false,
      display: {
        type: 'panel',
        // label: phase,
        label: userFriendlyLabels[phase],
        // font: 'mini',
        isVisible: phase === defaultPhase,
      },
    } as GuiElement,
  ]),
) as Record<ChessPhase, GuiElement<ChessLayoutKey>>

export const CHESS_DEBUG_ELEMENTS = [
  ...Object.values(phaseLabels), // top center HUD
] as const

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
