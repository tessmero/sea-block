/**
 * @file chess-game-config.ts
 *
 * Configurable for chess game.
 */

import type { PieceName } from 'games/chess/chess-enums'
import { PIECE_NAMES } from 'games/chess/chess-enums'
import type { ConfigTree, OptionItem } from './config-tree'
import { Configurable } from './configurable'

const chessGameConfigTree = {
  children: {

    // chessPieceType: {
    //   value: 'knight',
    //   options: PIECE_NAMES,
    //   resetOnChange: 'full',
    // } as OptionItem<PieceName>,

    // chessViewMode: {
    //   value: '3D',
    //   options: ['2D', '3D'],
    //   resetOnChange: 'full',
    // } as OptionItem<'2D' | '3D'>,

  },
} satisfies ConfigTree

// register Configurable
export class ChessGameConfig extends Configurable<typeof chessGameConfigTree> {
  static { Configurable.register('chess', () => new ChessGameConfig()) }
  tree = chessGameConfigTree
}
export const chessGameConfig = Configurable.create('chess') as ChessGameConfig
