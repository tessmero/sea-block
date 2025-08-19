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
  id: string
  description?: string
  requires?: Array<CollectibleName>
  layout: Array<Array<Cell>>
}

export type Cell = 'GG' | '~~' | '  ' | Piece // goal or water or empty cell or piece
export type Piece = `${PieceColor}${ShortPieceName}` // piece shorthand e.g. 'BP' for black pawn
export type PieceColor = 'W' | 'B' // white/black
export type ShortPieceName = 'P' | 'K' | 'Q' | 'H' | 'B' | 'R'
export type CollectibleName
  = 'pawn' | 'bishop' | 'rook' | 'knight' | 'queen' | 'king' // pieces
    | 'dual-vector-foil' // | 'long-stride' // powerups
