/**
 * @file chess-enums.ts
 *
 * Enumerations for chess game.
 */

export const CHESS_PHASES = [
  'player-choice', 'player-anim', 'pawn-anim', 'enemy-anim', // regular gameplay
  'place-pawn', // choose free tile on bottom row
  'reached-chest', // just cleared level, waiting for transition to reward-choice
  'reward-choice', // reward screen after reaching chest
  'game-over', // player was captured by red chess piece
] as const
export type ChessPhase = (typeof CHESS_PHASES)[number]

export const PIECE_NAMES = [
  'pawn', 'rook', 'knight', 'bishop', 'queen', 'king',
] as const
export type PieceName = (typeof PIECE_NAMES)[number]
