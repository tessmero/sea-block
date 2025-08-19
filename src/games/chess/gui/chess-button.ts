/**
 * @file chess-button.ts
 *
 * Button that includes Chess instance in event context.
 */

import type { ElementEvent, StaticElement } from 'guis/gui'
import type { Chess } from '../chess-helper'
import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'

export interface ChessButton extends StaticElement<ChessLayoutKey> {
  chessAction: (event: ChessButtonEvent) => void // like clickAction
}
export interface ChessButtonEvent extends ElementEvent {
  chess: Chess
}
