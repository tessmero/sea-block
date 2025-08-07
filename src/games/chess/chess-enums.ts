/**
 * @file chess-enums.ts
 *
 * Enumerations for chess game.
 */

export const CHESS_PHASES = [
  'player-choice', 'player-anim', 'place-pawn', // chess board gameplay
  'reward-choice', // reward screen after reaching chest
] as const
export type ChessPhase = (typeof CHESS_PHASES)[number]

export const PIECE_NAMES = [
  'pawn', 'rook', 'knight', 'bishop', 'queen', 'king',
] as const
export type PieceName = (typeof PIECE_NAMES)[number]
