/**
 * @file chess-gui.ts
 *
 * GUI implementationt that points to modules in src/games/chess/gui.
 * Also passes input events to src/games/chess/chess-helper,
 * so user can click terrain tiles used as chess board.
 */

import type { ElementEvent, GuiElement } from '../gui'
import { Gui } from '../gui'
import type { ProcessedSubEvent } from 'mouse-touch-input'
import type { Chess } from 'games/chess/chess-helper'
import { clickChess, getChessPhase, moveChess } from 'games/chess/chess-helper'
import { CHESS_LAYOUT } from 'guis/layouts/chess-layout'
import { CHESS_REWARDS_LAYOUT } from 'guis/layouts/chess-rewards-layout'
import { CHESS_HUD_ELEMENTS } from 'games/chess/gui/chess-hud-elements'
import { CHESS_DIALOG_ELEMENTS } from 'games/chess/gui/chess-dialog-elements'
import { CHESS_REWARD_ELEMENTS } from 'games/chess/gui/chess-reward-elements'
import { CHESS_DEBUG_ELEMENTS } from 'games/chess/gui/chess-debug-elements'
import type { ChessButton } from 'games/chess/gui/chess-button'

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
        ...CHESS_HUD_ELEMENTS,
        ...CHESS_DIALOG_ELEMENTS,
        ...CHESS_REWARD_ELEMENTS,
        ...CHESS_DEBUG_ELEMENTS,
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
