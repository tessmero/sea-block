/**
 * @file chess-levels.json.d.ts
 *
 * Types and module definition used to import chess level data.
 */

declare module '*chess-levels.json' {
  const value: ChessLevelsData
  export = value
}

export interface ChessLevelsData {
  levels: Array<ChessLevel>
}

export interface ChessLevel {
  description?: string
  requires?: Array<CollectibleName>
  layout: Array<Array<Cell>>
}

export type Cell = 'GG' | '  ' | Piece // goal or empty cell or piece
export type Piece = `${PieceColor}${PieceName}` // piece shorthand e.g. 'BP' for black pawn
export type PieceColor = 'W' | 'B' // white/black
export type PieceName = 'P' | 'K' | 'Q' | 'H' | 'B' | 'R'
export type CollectibleName
  = 'pawn' | 'bishop' | 'rook' | 'knight' | 'queen' | 'king' // pieces
    | 'dual-vector-foil' // powerups
