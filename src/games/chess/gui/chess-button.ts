/**
 * @file chess-button.ts
 *
 * Button that includes Chess instance in event context.
 */

import type { ElementEvent, StaticElement } from 'guis/gui'
import type { Chess } from '../chess-helper'

export interface ChessButton extends StaticElement {
  chessAction: (event: ChessButtonEvent) => void // like clickAction
}
export interface ChessButtonEvent extends ElementEvent {
  chess: Chess
}
