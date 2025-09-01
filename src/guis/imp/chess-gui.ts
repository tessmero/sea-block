/**
 * @file chess-gui.ts
 *
 * GUI implementationt that points to modules in src/games/chess/gui.
 * Also passes input events to src/games/chess/chess-helper,
 * so user can click terrain tiles used as chess board.
 */

import type { GuiElement, RegisteredGui } from '../gui'
import { Gui } from '../gui'
import type { ProcessedSubEvent } from 'input/mouse-touch-input'
import type { Chess } from 'games/chess/chess-helper'
import { getChessPhase } from 'games/chess/chess-helper'
import { CHESS_HUD_ELEMENTS } from 'games/chess/gui/chess-hud-elements'
import { CHESS_HUD_DIALOG_ELEMENTS } from 'games/chess/gui/chess-hud-dialog-elements'
import { CHESS_REWARD_ELEMENTS } from 'games/chess/gui/chess-rewards-elements'
import type { ChessButton } from 'games/chess/gui/chess-button'
import { clickChessWorld, hoverChessWorld, unclickChessWorld } from 'games/chess/chess-input-helper'
import { CHESS_DEBUG_ELEMENTS } from 'games/chess/gui/chess-debug-elements'
import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'
import { CHESS_LAYOUT } from 'guis/layouts/chess/chess-layout'
import { CHESS_REWARDS_LAYOUT } from 'guis/layouts/chess/chess-rewards-layout'
import { CHESS_REWARD_HELP_ELEMENTS } from 'games/chess/gui/chess-reward-help-elements'

const elements: Array<GuiElement<ChessLayoutKey>> = [
  ...CHESS_DEBUG_ELEMENTS,
  ...CHESS_HUD_ELEMENTS,
  ...CHESS_HUD_DIALOG_ELEMENTS,

  // separate layout
  ...CHESS_REWARD_ELEMENTS,
  ...CHESS_REWARD_HELP_ELEMENTS,
]

export class ChessGui extends Gui<ChessLayoutKey> {
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
      elements,
    } satisfies RegisteredGui<ChessLayoutKey>)

    // link chessAction to clickAction for all elements
    for (const elem of elements) {
      if ('chessAction' in elem) {
        const btn = elem as ChessButton
        btn.clickAction = (event) => {
          const { chess } = Gui.create('chess') as ChessGui
          btn.chessAction({ ...event, chess })
        }
      }
    }
  }

  // assigned in chess helper
  public chess!: Chess

  public click(event: ProcessedSubEvent): boolean {
    let hasConsumed = super.click(event)
    if (!hasConsumed) {
      hasConsumed = clickChessWorld(this.chess, event)
    }
    return hasConsumed
  }

  public unclick(event: ProcessedSubEvent): void {
    super.unclick(event)
    unclickChessWorld(this.chess, event)
  }

  public move(inputEvent: ProcessedSubEvent): boolean {
    const hasConsumed = super.move(inputEvent)
    if (!hasConsumed) {
      // hover on 2d or 3d chess board
      hoverChessWorld(this.chess, inputEvent)
    }
    return hasConsumed
  }
}
